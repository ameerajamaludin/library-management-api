import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  LessThan,
  Repository,
} from 'typeorm';

import { Borrow } from './entities/borrow.entity';
import { User } from '../users/entities/user.entity';
import { Copy } from '../copies/entities/copy.entity';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { BorrowResponseDto } from './dto/borrow-response.dto';
import { Return } from '../returns/entities/return.entity';
import { ReturnBorrowDto } from './dto/return-borrow.dto';

@Injectable()
export class BorrowsService {
  constructor(
    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,

    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,

    @InjectRepository(Copy)
    private readonly copiesRepository: Repository<Copy>,

    @InjectRepository(Return)
private readonly returnsRepository: Repository<Return>,
  ) {}

  // ==========================================
  // Build detailed response
  // ==========================================

  private buildResponse(
    borrow: Borrow,
  ): BorrowResponseDto {
    return {
      borrow_id: borrow.borrow_id,

      user_id: borrow.user_id,

      user: {
        user_id: borrow.user.user_id,
        name: borrow.user.name,
        email: borrow.user.email,
      },

      copy_id: borrow.copy_id,

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

      borrowed_at: borrow.borrowed_at,

      due_at: borrow.due_at,

      returned_at: borrow.returned_at,
    };
  }

  // ==========================================
  // POST /borrows
  // ==========================================

  async create(
    createBorrowDto: CreateBorrowDto,
    requesterUserId?: string,
    requesterRole?: string,
  ): Promise<BorrowResponseDto> {
    const {
      user_id,
      copy_id,
    } = createBorrowDto;

    if (
      requesterRole?.toUpperCase() === 'MEMBER' &&
      requesterUserId !== user_id
    ) {
      throw new ConflictException(
        'Members can only borrow books for themselves',
      );
    }

    // ------------------------------------------
    // Check user
    // ------------------------------------------

    const user =
      await this.usersRepository.findOne({
        where: {
          user_id,
        },
      });

    if (!user) {
      throw new NotFoundException(
        `User ${user_id} not found`,
      );
    }

    // ------------------------------------------
    // Check copy
    // ------------------------------------------

    const copy =
      await this.copiesRepository.findOne({
        where: {
          copy_id,
        },
        relations: {
          book: true,
        },
      });

    if (!copy) {
      throw new NotFoundException(
        `Copy ${copy_id} not found`,
      );
    }

    // ------------------------------------------
    // Check availability
    // ------------------------------------------

    if (copy.status !== 'AVAILABLE') {
      throw new ConflictException(
        `Copy ${copy_id} is not available`,
      );
    }

    // ------------------------------------------
    // Create borrowing dates
    // ------------------------------------------

    const borrowedAt = new Date();

    const dueAt = new Date(borrowedAt);

    dueAt.setDate(
      dueAt.getDate() + 14,
    );

    // ------------------------------------------
    // Create borrowing record
    // ------------------------------------------

    const borrow =
      this.borrowsRepository.create({
        user_id,
        copy_id,
        borrowed_at: borrowedAt,
        due_at: dueAt,
        returned_at: null,
      });

    await this.borrowsRepository.save(
      borrow,
    );

    // ------------------------------------------
    // Change copy status
    // ------------------------------------------

    copy.status = 'BORROWED';

    await this.copiesRepository.save(copy);

    // ------------------------------------------
    // Reload complete borrowing
    // ------------------------------------------

    const completeBorrow =
      await this.borrowsRepository.findOne({
        where: {
          borrow_id: borrow.borrow_id,
        },
        relations: {
          user: true,
          copy: {
            book: true,
          },
        },
      });

    if (!completeBorrow) {
      throw new NotFoundException(
        `Borrow ${borrow.borrow_id} not found`,
      );
    }

    return this.buildResponse(
      completeBorrow,
    );
  }


  // ==========================================
  // GET /borrows/overdue
  // ==========================================

  async findOverdue(): Promise<BorrowResponseDto[]> {
    const overdueBorrows =
      await this.borrowsRepository.find({
        where: {
          returned_at: IsNull(),
          due_at: LessThan(new Date()),
        },
        relations: {
          user: true,
          copy: {
            book: true,
          },
        },
        order: {
          due_at: 'ASC',
        },
      });

    return overdueBorrows.map((borrow) =>
      this.buildResponse(borrow),
    );
  }

  // ==========================================
  // POST /borrows/copy/:copyId/return
  // ==========================================

async returnByCopyId(
  copyId: number,
  returnBorrowDto: ReturnBorrowDto,
  requesterUserId?: string,
  requesterRole?: string,
): Promise<BorrowResponseDto> {
  // ------------------------------------------
  // Check copy
  // ------------------------------------------

  const copy =
    await this.copiesRepository.findOne({
      where: {
        copy_id: copyId,
      },
      relations: {
        book: true,
      },
    });

  if (!copy) {
    throw new NotFoundException(
      `Copy ${copyId} not found`,
    );
  }

  // ------------------------------------------
  // Find active borrowing
  // ------------------------------------------

  const borrow =
    await this.borrowsRepository.findOne({
      where: {
        copy_id: copyId,
        returned_at: IsNull(),
      },
      relations: {
        user: true,
        copy: {
          book: true,
        },
      },
    });

  if (!borrow) {
    throw new ConflictException(
      `Copy ${copyId} has no active borrowing`,
    );
  }

  if (
    requesterRole?.toUpperCase() === 'MEMBER' &&
    requesterUserId !== borrow.user_id
  ) {
    throw new ConflictException(
      'Members can only return their own borrowed books',
    );
  }

  // ------------------------------------------
  // Mark borrowing as returned
  // ------------------------------------------

  const returnedAt = new Date();

  borrow.returned_at = returnedAt;

  await this.borrowsRepository.save(
    borrow,
  );

  // ------------------------------------------
  // Create return record
  // ------------------------------------------

  const returnRecord =
    this.returnsRepository.create({
      borrow_id: borrow.borrow_id,
      returned_at: returnedAt,
      condition: returnBorrowDto.condition,
      notes: returnBorrowDto.notes ?? null,
    });

  await this.returnsRepository.save(
    returnRecord,
  );

  // ------------------------------------------
  // Make copy available
  // ------------------------------------------

  copy.status = 'AVAILABLE';

  await this.copiesRepository.save(copy);

  // ------------------------------------------
  // Update response copy status
  // ------------------------------------------

  borrow.copy.status = 'AVAILABLE';

  return this.buildResponse(
    borrow,
  );
}
}