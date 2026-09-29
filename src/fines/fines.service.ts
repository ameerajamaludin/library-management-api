import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Fine } from './entities/fine.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

const DEFAULT_FINE_PER_DAY = 1;

@Injectable()
export class FinesService {
  constructor(
    @InjectRepository(Fine)
    private readonly finesRepository: Repository<Fine>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
  ) {}

  // ==========================================
  // POST /fines
  // ==========================================

  async create(
    createFineDto: CreateFineDto,
  ) {
    const borrow =
      await this.borrowsRepository.findOne({
        where: {
          borrow_id:
            createFineDto.borrow_id,
        },
        relations: {
          user: true,
          copy: {
            book: true,
          },
        },
      });

    if (!borrow) {
      throw new NotFoundException(
        `Borrow ${createFineDto.borrow_id} not found`,
      );
    }

    const existingFine = await this.finesRepository.findOne({
      where: {
        borrow_id: createFineDto.borrow_id,
      },
    });

    if (existingFine) {
      throw new ConflictException(
        `A fine already exists for borrow ${createFineDto.borrow_id}`,
      );
    }

    const fine =
      this.finesRepository.create({
        borrow_id:
          createFineDto.borrow_id,
        amount: createFineDto.amount,
        reason: createFineDto.reason,
        status: createFineDto.status,
        paid_at:
          createFineDto.paid_at ?? null,
      });

    const savedFine =
      await this.finesRepository.save(fine);

    return this.findOne(
      savedFine.fine_id,
    );
  }


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

    const asOf = borrow.returned_at ?? new Date();

    if (borrow.due_at >= asOf) {
      throw new ConflictException(
        `Borrow ${borrowId} is not overdue`,
      );
    }

    const existingFine = await this.finesRepository.findOne({
      where: { borrow_id: borrowId },
    });

    if (existingFine) {
      throw new ConflictException(
        `A fine already exists for borrow ${borrowId}`,
      );
    }

    const overdueDays = Math.max(
      1,
      Math.ceil(
        (asOf.getTime() - borrow.due_at.getTime()) /
          (1000 * 60 * 60 * 24),
      ),
    );

    const dailyRate = this.getDailyFineRate();
    const amount = Number(
      (overdueDays * dailyRate).toFixed(2),
    );

    const fine = this.finesRepository.create({
      borrow_id: borrowId,
      amount,
      reason: 'Late return',
      status: 'UNPAID',
      paid_at: null,
    });

    const savedFine = await this.finesRepository.save(fine);

    return this.findOne(savedFine.fine_id);
  }

  private getDailyFineRate(): number {
    const configuredRate = Number(
      process.env.FINE_PER_DAY,
    );

    if (Number.isFinite(configuredRate) && configuredRate >= 0) {
      return configuredRate;
    }

    return DEFAULT_FINE_PER_DAY;
  }

  // ==========================================
  // GET /fines
  // ==========================================

  async findAll(
    requesterUserId?: string,
    requesterRole?: string,
  ) {
    const fines = await this.finesRepository.find({
      relations: {
        borrow: {
          user: true,
          copy: {
            book: true,
          },
        },
      },
      order: {
        fine_id: 'DESC',
      },
    });

    if (requesterRole?.toUpperCase() === 'MEMBER') {
      return fines.filter(
        (fine) =>
          fine.borrow?.user?.user_id === requesterUserId,
      );
    }

    return fines;
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
        'Members can only access their own fines',
      );
    }

    return {
      fine_id: fine.fine_id,

      borrow_id: fine.borrow_id,

      amount: fine.amount,

      reason: fine.reason,

      status: fine.status,

      paid_at: fine.paid_at,

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
  ) {
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

    return this.finesRepository.find({
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
      },
      order: {
        fine_id: 'DESC',
      },
    });
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