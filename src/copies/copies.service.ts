import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { UpdateCopyDto } from './dto/update-copy.dto';

import { In, IsNull, Repository } from 'typeorm';

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
  updateCopyDto: UpdateCopyDto,
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

  if (updateCopyDto.barcode !== undefined) {
    copy.barcode = updateCopyDto.barcode;
  }

  if (updateCopyDto.status !== undefined) {
    copy.status = updateCopyDto.status;
  }

  return this.copiesRepository.save(copy);
}

  // ==========================================
  // GET /copies/:id
  // ==========================================

  async findOne(id: string) {
    const search = id.trim();

    const copyId = Number(search);

    // ------------------------------------------
    // Exact copy ID
    // ------------------------------------------

    if (
      search !== '' &&
      Number.isInteger(copyId)
    ) {
      const copy =
        await this.copiesRepository.findOne({
          where: {
            copy_id: copyId,
          },

          relations: {
            book: true,

            borrows: {
              user: true,
            },
          },
        });

      if (copy) {
        return this.toCopyResponse(copy);
      }
    }

    // ------------------------------------------
    // Fall back to a case-insensitive partial
    // book name search
    // ------------------------------------------

    if (search === '') {
      throw new NotFoundException(
        `Copy or book ${id} not found`,
      );
    }

    const books =
      await this.booksRepository
        .createQueryBuilder('book')
        .where(
          'LOWER(book.title) LIKE LOWER(:name)',
          {
            name: `%${search}%`,
          },
        )
        .orderBy('book.title', 'ASC')
        .getMany();

    if (books.length === 0) {
      throw new NotFoundException(
        `Copy or book ${id} not found`,
      );
    }

    const copies =
      await this.copiesRepository.find({
        where: {
          openlibrary_work_id: In(
            books.map(
              (book) =>
                book.openlibrary_work_id,
            ),
          ),
        },

        relations: {
          book: true,

          borrows: {
            user: true,
          },
        },

        order: {
          copy_id: 'ASC',
        },
      });

    return copies.map(
      (copy) =>
        this.toCopyResponse(copy),
    );
  }

  private toCopyResponse(copy: Copy) {
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

  async remove(id: number) {
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

  // A Copy that is actively borrowed cannot be deleted
    // until it is returned. Without this the delete fails on
    // the borrows foreign key and surfaces as an opaque 500,
    // so the conflict is reported explicitly like the
    // equivalent Book checks.
    const activeBorrow =
      await this.borrowsRepository.findOne({
        where: {
          copy_id: id,
          returned_at: IsNull(),
        },
      });

    if (activeBorrow) {
      throw new ConflictException(
        `Copy ${id} cannot be deleted because it is actively borrowed.`,
      );
    }

    await this.copiesRepository.remove(copy);

  return {
    message: `Copy ${id} deleted successfully`,
  };
}
}
