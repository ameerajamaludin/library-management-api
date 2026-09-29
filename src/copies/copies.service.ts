import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { Copy } from './entities/copy.entity';
import { Book } from '../books/entities/book.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

@Injectable()
export class CopiesService {
  constructor(
    @InjectRepository(Copy)
    private readonly copiesRepository: Repository<Copy>,

    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,

    @InjectRepository(Borrow)
    private readonly borrowsRepository: Repository<Borrow>,
  ) {}

  // ==========================================
  // GET /books/:id/copies
  // ==========================================

  async findByBook(
    openlibraryWorkId: string,
  ) {
    const book =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id:
            openlibraryWorkId,
        },
      });

    if (!book) {
      throw new NotFoundException(
        `Book ${openlibraryWorkId} not found`,
      );
    }

    const copies =
      await this.copiesRepository.find({
        where: {
          openlibrary_work_id:
            openlibraryWorkId,
        },
        order: {
          copy_id: 'ASC',
        },
      });

    const totalCopies =
      copies.length;

    const availableCopies =
      copies.filter(
        (copy) =>
          copy.status === 'AVAILABLE',
      ).length;

    return {
      book: {
        openlibrary_work_id:
          book.openlibrary_work_id,
        title: book.title,
      },

      totalCopies,

      availableCopies,

      copies,
    };
  }

  // ==========================================
  // POST /books/:id/copies
  // ==========================================

  async create(
    openlibraryWorkId: string,
    barcode: string,
    status: string,
  ): Promise<Copy> {
    const book =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id:
            openlibraryWorkId,
        },
      });

    if (!book) {
      throw new NotFoundException(
        `Book ${openlibraryWorkId} not found`,
      );
    }

    const copy =
      this.copiesRepository.create({
        openlibrary_work_id:
          openlibraryWorkId,
        barcode,
        status,
      });

    return this.copiesRepository.save(
      copy,
    );
  }

  // ==========================================
  // PATCH /copies/:id
  // ==========================================

  async update(
    copyId: number,
    status: string,
  ): Promise<Copy> {
    const copy =
      await this.copiesRepository.findOne({
        where: {
          copy_id: copyId,
        },
      });

    if (!copy) {
      throw new NotFoundException(
        `Copy ${copyId} not found`,
      );
    }

    copy.status = status;

    return this.copiesRepository.save(
      copy,
    );
  }

  // ==========================================
  // GET /copies/:id
  // ==========================================

  async findOne(id: number) {
    const copy =
      await this.copiesRepository.findOne({
        where: {
          copy_id: id,
        },

        relations: {
          book: true,

          borrows: {
            user: true,
            returnRecord: true,
            fines: true,
          },
        },
      });

    if (!copy) {
      throw new NotFoundException(
        `Copy ${id} not found`,
      );
    }

    const activeBorrow =
      copy.borrows.find(
        (borrow) =>
          borrow.returned_at === null,
      );

    const mapBorrow = (borrow: typeof copy.borrows[number]) => ({
      borrow_id:
        borrow.borrow_id,

      user_id:
        borrow.user_id,

      user: {
        user_id:
          borrow.user.user_id,

        name:
          borrow.user.name,

        email:
          borrow.user.email,
      },

      copy_id:
        borrow.copy_id,

      borrowed_at:
        borrow.borrowed_at,

      due_at:
        borrow.due_at,

      returned_at:
        borrow.returned_at,

      returnRecord:
        borrow.returnRecord
          ? {
              return_id:
                borrow.returnRecord
                  .return_id,

              borrow_id:
                borrow.returnRecord
                  .borrow_id,

              returned_at:
                borrow.returnRecord
                  .returned_at,

              condition:
                borrow.returnRecord
                  .condition,

              notes:
                borrow.returnRecord
                  .notes,
            }
          : null,

      fines:
        (borrow.fines ?? []).map(
          (fine) => ({
            fine_id:
              fine.fine_id,

            amount:
              fine.amount,

            reason:
              fine.reason,

            status:
              fine.status,

            paid_at:
              fine.paid_at,
          }),
        ),
    });

    return {
      copy_id: copy.copy_id,

      barcode: copy.barcode,

      status: copy.status,

      book: {
        openlibrary_work_id:
          copy.book.openlibrary_work_id,

        title: copy.book.title,

        isbn: copy.book.isbn,
      },

      currentBorrow: activeBorrow
        ? mapBorrow(activeBorrow)
        : null,

      borrowHistory:
        copy.borrows
          .sort(
            (a, b) =>
              b.borrow_id -
              a.borrow_id,
          )
          .map(mapBorrow),
    };
  }

  // ==========================================
  // GET /copies/:id/borrows
  // ==========================================

  async findBorrowHistory(
    id: number,
  ) {
    const copy =
      await this.copiesRepository.findOne({
        where: {
          copy_id: id,
        },
      });

    if (!copy) {
      throw new NotFoundException(
        `Copy ${id} not found`,
      );
    }

    return this.borrowsRepository.find({
      where: {
        copy_id: id,
      },

      relations: {
        user: true,
        returnRecord: true,
        fines: true,
      },

      order: {
        borrow_id: 'DESC',
      },
    });
  }
}
