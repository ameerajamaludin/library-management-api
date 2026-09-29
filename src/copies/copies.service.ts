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
        ? {
            borrow_id:
              activeBorrow.borrow_id,

            user_id:
              activeBorrow.user_id,

            user: {
              user_id:
                activeBorrow.user.user_id,

              name:
                activeBorrow.user.name,

              email:
                activeBorrow.user.email,
            },

            copy_id:
              activeBorrow.copy_id,

            borrowed_at:
              activeBorrow.borrowed_at,

            due_at:
              activeBorrow.due_at,

            returned_at:
              activeBorrow.returned_at,
          }
        : null,
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
      },

      order: {
        borrow_id: 'DESC',
      },
    });
  }
}