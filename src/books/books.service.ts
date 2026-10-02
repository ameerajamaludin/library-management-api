import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BooksQueryDto } from './dto/books-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import { Book } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { Copy } from '../copies/entities/copy.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,

    @InjectRepository(BookAuthor)
    private readonly bookAuthorsRepository: Repository<BookAuthor>,

    @InjectRepository(Copy)
    private readonly copiesRepository: Repository<Copy>,
  ) {}

  // ==========================================
  // GET /books
  // ==========================================

  async findAll(query: BooksQueryDto) {
    const {
      search,
      isbn,
      categoryId,
      fictionNonfiction,
      status,
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const queryBuilder = this.booksRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.category', 'category')
      .leftJoinAndSelect('book.copies', 'copy')
      .orderBy('book.title', 'ASC')
      .skip(skip)
      .take(limit);

    if (search) {
      queryBuilder.andWhere(
        '(LOWER(book.title) LIKE LOWER(:search) OR LOWER(book.description) LIKE LOWER(:search))',
        {
          search: `%${search}%`,
        },
      );
    }

    if (status) {
      queryBuilder.andWhere(
        'book.status = :status',
        {
          status,
        },
      );
    } else {
      queryBuilder.andWhere(
        'book.status = :defaultStatus',
        {
          defaultStatus: 'ACTIVE',
        },
      );
    }

    if (isbn) {
      queryBuilder.andWhere(
        'LOWER(book.isbn) LIKE LOWER(:isbn)',
        {
          isbn: `%${isbn}%`,
        },
      );
    }

    if (categoryId) {
      queryBuilder.andWhere(
        'book.category_id = :categoryId',
        {
          categoryId,
        },
      );
    }

    if (fictionNonfiction) {
      queryBuilder.andWhere(
        'LOWER(book.fiction_nonfiction) = LOWER(:fictionNonfiction)',
        {
          fictionNonfiction,
        },
      );
    }

    const [data, total] =
      await queryBuilder.getManyAndCount();

    return {
      data,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  // ==========================================
  // POST /books
  // ==========================================

  async createBook(createBookDto: CreateBookDto) {
    const existingBook =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id:
            createBookDto.openlibrary_work_id,
        },
      });

    if (existingBook) {
      throw new ConflictException(
        `Book ${createBookDto.openlibrary_work_id} already exists`,
      );
    }

    const book =
      this.booksRepository.create(createBookDto);

    return this.booksRepository.save(book);
  }

  // ==========================================
  // PATCH /books/:id
  // ==========================================

  async updateBook(
    id: string,
    updateBookDto: UpdateBookDto,
    updatedBy: string,
  ) {
    const book =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id: id,
        },
      });

    if (!book) {
      throw new NotFoundException(
        `Book ${id} not found`,
      );
    }

    const newWorkId =
      updateBookDto.openlibrary_work_id ?? id;

    // If changing the Open Library work ID,
    // make sure another book does not already use it.
    if (newWorkId !== id) {
      const existingBook =
        await this.booksRepository.findOne({
          where: {
            openlibrary_work_id: newWorkId,
          },
        });

      if (existingBook) {
        throw new ConflictException(
          `Book ${newWorkId} already exists`,
        );
      }
    }

    /*
     * Updating the book's primary key cascades to the rows that
     * reference it (copies.openlibrary_work_id and
     * book_authors.openlibrary_work_id), both of which are defined
     * with ON UPDATE CASCADE. Existing copy relationships are
     * preserved rather than detached, recreated, or lost.
     */
    await this.booksRepository.update(
      {
        openlibrary_work_id: id,
      },
      {
        ...updateBookDto,
        openlibrary_work_id: newWorkId,
        updated_by: updatedBy,
        updated_at: new Date(),
      },
    );

    return this.booksRepository.findOne({
      where: {
        openlibrary_work_id: newWorkId,
      },
      relations: {
        category: true,
        copies: true,
      },
    });
  }

  // ==========================================
  // DELETE /books/:id
  // ==========================================

  async deleteBook(id: string) {
    const book =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id: id,
        },
      });

    if (!book) {
      throw new NotFoundException(
        `Book ${id} not found`,
      );
    }

    const copyCount =
      await this.copiesRepository.count({
        where: {
          openlibrary_work_id: id,
        },
      });

    const authorRelationshipCount =
      await this.bookAuthorsRepository.count({
        where: {
          openlibrary_work_id: id,
        },
      });

    if (copyCount > 0) {
      throw new ConflictException(
        `Book ${id} cannot be deleted because it has ${copyCount} physical copies.`,
      );
    }

    if (authorRelationshipCount > 0) {
      throw new ConflictException(
        `Book ${id} cannot be deleted because it has author relationships.`,
      );
    }

    await this.booksRepository.remove(book);

    return {
      message: `Book ${id} deleted successfully`,
    };
  }

  // ==========================================
  // GET /books/:id
  // ==========================================

  async findOne(id: string) {
    const book =
      await this.booksRepository.findOne({
        where: {
          openlibrary_work_id: id,
        },
        relations: {
          category: true,
          copies: true,
        },
      });

    if (book) {
      return this.toBookResponse(book);
    }

    // ------------------------------------------
    // Fall back to a case-insensitive partial
    // title search
    // ------------------------------------------

    const books =
      await this.booksRepository
        .createQueryBuilder('book')
        .leftJoinAndSelect('book.category', 'category')
        .leftJoinAndSelect('book.copies', 'copy')
        .where(
          'LOWER(book.title) LIKE LOWER(:title)',
          {
            title: `%${id}%`,
          },
        )
        .orderBy('book.title', 'ASC')
        .getMany();

    if (books.length === 0) {
      throw new NotFoundException(
        `Book ${id} not found`,
      );
    }

    return books;
  }

  private toBookResponse(book: Book) {
    const totalCopies = book.copies.length;

    const availableCopies =
      book.copies.filter(
        (copy) => copy.status === 'AVAILABLE',
      ).length;

    return {
      openlibrary_work_id:
        book.openlibrary_work_id,

      totalCopies,
      availableCopies,

      title: book.title,
      description: book.description,
      published_month: book.published_month,
      published_year: book.published_year,
      category_id: book.category_id,
      fiction_nonfiction:
        book.fiction_nonfiction,
      isbn: book.isbn,
      status: book.status,

      cover_image_small:
        book.cover_image_small,

      cover_image_medium:
        book.cover_image_medium,

      cover_image_large:
        book.cover_image_large,

      category: book.category,
      copies: book.copies,
    };
  }

  // ==========================================
  // GET /books/status/:status
  // ==========================================

  async findByStatus(status: string) {
    return this.booksRepository.find({
      where: {
        status,
      },
      relations: {
        category: true,
        copies: true,
      },
      order: {
        title: 'ASC',
      },
    });
  }
}
