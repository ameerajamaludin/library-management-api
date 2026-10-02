import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, LessThan, Repository } from 'typeorm';

import { Fine } from './entities/fine.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { UpdateFineDto } from './dto/update-fine.dto';
import {
  FineUserResponseDto,
  FineWithBorrowResponseDto,
} from './dto/fine-response.dto';
import { calculateOverdueDays } from '../common/overdue-days.util';

const DEFAULT_FINE_PER_DAY = 2;

// How often active overdue fines are recalculated so a
// fine keeps growing while its borrow stays overdue.
const FINE_RECALCULATION_INTERVAL_MS = 60 * 60 * 1000;

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly finesRepository: Repository<Fine>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
  ) {}

  private fineRecalculationTimer?: ReturnType<
    typeof setInterval
  >;

  private fineRecalculationInProgress = false;

  // ==========================================
  // POST /fines/overdue/:borrowId
  // ==========================================

  async createForOverdueBorrow(
    borrowId: number,
  ) {
    const borrow = await this.borrowsRepository.findOne({
      where: { borrow_id: borrowId },
      relations: {
        user: true,
        copy: {
          book: true,
        },
      },
    });

    if (!borrow) {
      throw new NotFoundException(
        `Borrow ${borrowId} not found`,
      );
    }

    const overdueDays = calculateOverdueDays(
      borrow.due_at,
      borrow.returned_at,
    );

    if (overdueDays < 1) {
      throw new ConflictException(
        `Borrow ${borrowId} is not overdue`,
      );
    }

    const fine = await this.applyFineForOverdueBorrow(
      borrow,
      overdueDays,
    );

    return this.findOne(fine.fine_id);
  }

  private async applyFineForOverdueBorrow(
    borrow: Borrow,
    overdueDays: number,
  ): Promise<Fine> {
    // The lookup and the write run in one
    // transaction so a failure cannot leave a
    // partially applied fine behind.
    return this.finesRepository.manager.transaction(
      async (manager) => {
        // Lock the borrow row so two runs cannot
        // both decide that no fine exists and each
        // create one for the same borrow.
        await manager
          .createQueryBuilder()
          .setLock('pessimistic_write')
          .from(Borrow, 'borrow')
          .where(
            'borrow.borrow_id = :borrowId',
            { borrowId: borrow.borrow_id },
          )
          .getOne();

        const existingFine = await manager.findOne(
          Fine,
          {
            where: {
              borrow_id: borrow.borrow_id,
            },
          },
        );

        // A paid fine is settled, so accumulation
        // stops and its amount is left exactly as
        // paid.
        if (existingFine?.status === 'PAID') {
          return existingFine;
        }

        const amount = Number(
          (overdueDays * this.getDailyFineRate()).toFixed(2),
        );

        // Recalculating the same day count always
        // yields the same amount, so repeating this
        // is idempotent and never creates a second
        // fine for the borrow.
        if (existingFine) {
          existingFine.amount = amount;
          existingFine.overdue_days = overdueDays;

          return manager.save(Fine, existingFine);
        }

        return manager.save(
          manager.create(Fine, {
            borrow_id: borrow.borrow_id,
            amount,
            overdue_days: overdueDays,
            reason: 'Late return',
            status: 'UNPAID',
            paid_at: null,
          }),
        );
      },
    );
  }

  private getDailyFineRate(): number {
    // The Core Business Rules fix the fine rate at
    // RM2 per overdue day, so it is deliberately not
    // configurable.
    return DEFAULT_FINE_PER_DAY;
  }

  // ==========================================
  // Automatic fine accumulation
  // ==========================================

  async recalculateActiveOverdueFines(): Promise<void> {
    const overdueCutoff = new Date(
      Date.now() - 1000 * 60 * 60 * 24,
    );

    const activeOverdueBorrows =
      await this.borrowsRepository.find({
        where: {
          returned_at: IsNull(),
          due_at: LessThan(overdueCutoff),
        },
      });

    for (const borrow of activeOverdueBorrows) {
      await this.applyFineForOverdueBorrow(
        borrow,
        calculateOverdueDays(borrow.due_at),
      );
    }
  }

  onModuleInit(): void {
    this.runFineRecalculation();

    this.fineRecalculationTimer = setInterval(
      () => this.runFineRecalculation(),
      FINE_RECALCULATION_INTERVAL_MS,
    );
  }

  onModuleDestroy(): void {
    if (this.fineRecalculationTimer) {
      clearInterval(this.fineRecalculationTimer);

      this.fineRecalculationTimer = undefined;
    }
  }

  private async runFineRecalculation(): Promise<void> {
    if (this.fineRecalculationInProgress) {
      return;
    }

    this.fineRecalculationInProgress = true;

    try {
      await this.recalculateActiveOverdueFines();
    } catch {
      // A failed recalculation must never take the
      // API process down; the next run retries.
    } finally {
      this.fineRecalculationInProgress = false;
    }
  }

  // ==========================================
  // GET /fines
  // ==========================================

  async findAll(
    requesterUserId?: string,
    requesterRole?: string,
  ): Promise<FineWithBorrowResponseDto[]> {
    const fines = await this.finesRepository.find({
      relations: {
        borrow: {
          user: true,
          copy: {
            book: true,
          },
        },
        paidBy: true,
      },
      order: {
        fine_id: 'DESC',
      },
    });

    if (requesterRole?.toUpperCase() === 'MEMBER') {
      return fines
        .filter(
          (fine) =>
            fine.borrow?.user?.user_id === requesterUserId,
        )
        .map((fine) =>
          this.toFineWithBorrowResponse(fine),
        );
    }

    return fines.map((fine) =>
      this.toFineWithBorrowResponse(fine),
    );
  }

  // Maps a stored fine to the documented list
  // response, so only the contract fields are
  // exposed instead of the raw entity.
  private toFineWithBorrowResponse(
    fine: Fine,
  ): FineWithBorrowResponseDto {
    const borrow = fine.borrow;

    return {
      fine_id: fine.fine_id,
      borrow_id: fine.borrow_id,
      amount: fine.amount,
      overdue_days: fine.overdue_days,
      reason: fine.reason,
      status: fine.status,
      paid_at: fine.paid_at,
      paid_by: fine.paid_by,
      paid_by_user: this.toPayerProfile(fine),

      borrow: {
        borrow_id: borrow.borrow_id,
        user_id: borrow.user_id,
        copy_id: borrow.copy_id,
        borrowed_at: borrow.borrowed_at,
        due_at: borrow.due_at,
        returned_at: borrow.returned_at,

        user: {
          user_id: borrow.user.user_id,
          name: borrow.user.name,
          email: borrow.user.email,
        },

        copy: {
          copy_id: borrow.copy.copy_id,
          barcode: borrow.copy.barcode,
          status: borrow.copy.status,
        },

        book: {
          openlibrary_work_id:
            borrow.copy.book.openlibrary_work_id,
          title: borrow.copy.book.title,
          isbn: borrow.copy.book.isbn,
        },
      },
    };
  }

  // The payer profile is shown next to the stored
  // paid_by ID. It resolves to null once that user is
  // deleted, while paid_by keeps the historical ID.
  private toPayerProfile(
    fine: Fine,
  ): FineUserResponseDto | null {
    return fine.paidBy
      ? {
          user_id: fine.paidBy.user_id,
          name: fine.paidBy.name,
          email: fine.paidBy.email,
        }
      : null;
  }

  // ==========================================
  // GET /fines/:id
  // ==========================================

  async findOne(
    id: number,
    requesterUserId?: string,
    requesterRole?: string,
  ) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
        relations: {
          borrow: {
            user: true,
            copy: {
              book: true,
            },
          },
          paidBy: true,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    return {
      fine_id: fine.fine_id,

      borrow_id: fine.borrow_id,

      amount: fine.amount,

      overdue_days: fine.overdue_days,

      reason: fine.reason,

      status: fine.status,

      paid_at: fine.paid_at,

      paid_by: fine.paid_by,

      paid_by_user: this.toPayerProfile(fine),

      user: fine.borrow?.user
        ? {
            user_id:
              fine.borrow.user.user_id,
            name:
              fine.borrow.user.name,
            email:
              fine.borrow.user.email,
          }
        : null,

      copy: fine.borrow?.copy
        ? {
            copy_id:
              fine.borrow.copy.copy_id,
            barcode:
              fine.borrow.copy.barcode,
            status:
              fine.borrow.copy.status,
          }
        : null,

      book: fine.borrow?.copy?.book
        ? {
            openlibrary_work_id:
              fine.borrow.copy.book
                .openlibrary_work_id,
            title:
              fine.borrow.copy.book.title,
            isbn:
              fine.borrow.copy.book.isbn,
          }
        : null,
    };
  }

  // ==========================================
  // GET /fines/borrow/:borrowId
  // ==========================================

  async findByBorrowId(
    borrowId: number,
    requesterUserId?: string,
    requesterRole?: string,
  ): Promise<FineWithBorrowResponseDto[]> {
    const borrow =
      await this.borrowsRepository.findOne({
        where: {
          borrow_id: borrowId,
        },
      });

    if (!borrow) {
      throw new NotFoundException(
        `Borrow ${borrowId} not found`,
      );
    }

    if (
      requesterRole?.toUpperCase() === 'MEMBER' &&
      borrow.user_id !== requesterUserId
    ) {
      throw new ForbiddenException(
        'Members can only access fines for their own borrows',
      );
    }

    const fines = await this.finesRepository.find({
      where: {
        borrow_id: borrowId,
      },
      relations: {
        borrow: {
          user: true,
          copy: {
            book: true,
          },
        },
        paidBy: true,
      },
      order: {
        fine_id: 'DESC',
      },
    });

    return fines.map((fine) =>
      this.toFineWithBorrowResponse(fine),
    );
  }

  // ==========================================
  // POST /fines/:id/pay
  // ==========================================

  async pay(
    id: number,
    requesterUserId?: string,
    requesterRole?: string,
  ) {
    const fine = await this.finesRepository.findOne({
      where: { fine_id: id },
      relations: {
        borrow: {
          user: true,
        },
      },
    });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    if (
      requesterRole?.toUpperCase() === 'MEMBER' &&
      fine.borrow?.user?.user_id !== requesterUserId
    ) {
      throw new ForbiddenException(
        'Members can only pay their own fines',
      );
    }

    if (fine.status === 'PAID') {
      throw new ConflictException(
        `Fine ${id} is already paid`,
      );
    }

    fine.status = 'PAID';
    fine.paid_at = new Date();

    // Whoever settled the fine is recorded, so an
    // ADMIN or LIBRARIAN paying on behalf of a
    // member is attributed to that staff member.
    fine.paid_by = requesterUserId ?? null;

    this.assertPayerRecorded(fine);

    await this.finesRepository.save(fine);

    return this.findOne(
      id,
      requesterUserId,
      requesterRole,
    );
  }

  // ==========================================
  // PATCH /fines/:id
  // ==========================================

  // A PAID fine must always name who paid it, so the
  // payment history stays attributable.
  private assertPayerRecorded(
    fine: Fine,
  ): void {
    if (fine.status === 'PAID' && !fine.paid_by) {
      throw new ConflictException(
        `Fine ${fine.fine_id} cannot be PAID without a payer`,
      );
    }
  }

  async update(
    id: number,
    updateFineDto: UpdateFineDto,
  ) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    Object.assign(
      fine,
      updateFineDto,
    );

    this.assertPayerRecorded(fine);

    return this.finesRepository.save(fine);
  }

  // ==========================================
  // DELETE /fines/:id
  // ==========================================

  async remove(id: number) {
    const fine =
      await this.finesRepository.findOne({
        where: {
          fine_id: id,
        },
      });

    if (!fine) {
      throw new NotFoundException(
        `Fine ${id} not found`,
      );
    }

    await this.finesRepository.remove(fine);

    return {
      message: `Fine ${id} deleted successfully`,
    };
  }
}