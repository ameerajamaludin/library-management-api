import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import {
  IsNull,
  Not,
  Repository,
} from 'typeorm';

import { Return } from './entities/return.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(Return)
    private readonly returnsRepository: Repository<Return>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
  ) {}

  // ==========================================
  // GET /returns
  // ==========================================

  async findAll() {
    const returnRecords =
      await this.returnsRepository.find({
        relations: {
          borrow: {
            user: true,

            copy: {
              book: true,
            },
          },
        },

        order: {
          return_id: 'DESC',
        },
      });

    return returnRecords.map(
      (returnRecord) =>
        this.toReturnResponse(returnRecord),
    );
  }

  // ==========================================
  // GET /returns/history
  // ==========================================

  async findReturnedBorrows() {
    const borrows =
      await this.borrowsRepository.find({
        where: {
          returned_at: Not(IsNull()),
        },

        relations: {
          user: true,

          copy: {
            book: true,
          },

          returnRecord: true,
        },

        order: {
          borrow_id: 'DESC',
        },
      });

    return borrows.map((borrow) => ({
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

      book: {
        openlibrary_work_id:
          borrow.copy.book.openlibrary_work_id,
        title: borrow.copy.book.title,
        isbn: borrow.copy.book.isbn,
      },

      copy: {
        copy_id: borrow.copy.copy_id,
        barcode: borrow.copy.barcode,
        status: borrow.copy.status,
      },

      returnRecord: borrow.returnRecord
        ? {
            return_id:
              borrow.returnRecord.return_id,
            condition:
              borrow.returnRecord.condition,
            notes: borrow.returnRecord.notes,
          }
        : null,
    }));
  }

  // ==========================================
  // GET /returns/:returnId
  // ==========================================

  async findOne(
    returnId: number,
  ) {
    const returnRecord =
      await this.returnsRepository.findOne({
        where: {
          return_id: returnId,
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

    if (!returnRecord) {
      throw new NotFoundException(
        `Return ${returnId} not found`,
      );
    }

    return this.toReturnResponse(
      returnRecord,
    );
  }

  private toReturnResponse(
    returnRecord: Return,
  ) {
    const borrow = returnRecord.borrow;

    return {
      return_id: returnRecord.return_id,
      borrow_id: returnRecord.borrow_id,
      returned_at: returnRecord.returned_at,
      condition: returnRecord.condition,
      notes: returnRecord.notes,

      user: {
        user_id: borrow.user.user_id,
        name: borrow.user.name,
        email: borrow.user.email,
      },

      book: {
        openlibrary_work_id:
          borrow.copy.book.openlibrary_work_id,
        title: borrow.copy.book.title,
        isbn: borrow.copy.book.isbn,
      },

      copy: {
        copy_id: borrow.copy.copy_id,
        barcode: borrow.copy.barcode,
        status: borrow.copy.status,
      },
    };
  }
}
