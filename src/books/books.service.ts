import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BooksQueryDto } from './dto/books-query.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import { Book } from './entities/book.entity';
import { Author } from '../authors/entities/author.entity';
import { BookAuthor } from './entities/book-author.entity';
import { Copy } from '../copies/entities/copy.entity';



@Injectable()
export class BooksService {
constructor(
  @InjectRepository(Book)
  private readonly booksRepository: Repository<Book>,

  @InjectRepository(BookAuthor)
  private readonly bookAuthorsRepository: Repository<BookAuthor>,

  @InjectRepository(Author)
  private readonly authorsRepository: Repository<Author>,

  @InjectRepository(Copy)
  private readonly copiesRepository: Repository<Copy>,
) {}

async findAll(query: BooksQueryDto) {
  const {
    search,
    isbn,
    categoryId,
    fictionNonfiction,
    status,
    page,
    limit,
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

  const [data, total] = await queryBuilder.getManyAndCount();

  return {
    data,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

async createBook(createBookDto: CreateBookDto) {
  const existingBook = await this.booksRepository.findOne({
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

  const book = this.booksRepository.create(createBookDto);

  return this.booksRepository.save(book);
}

async updateBook(
  id: string,
  updateBookDto: UpdateBookDto,
) {
  const book = await this.booksRepository.findOne({
    where: {
      openlibrary_work_id: id,
    },
  });

  if (!book) {
    throw new NotFoundException(
      `Book ${id} not found`,
    );
  }

  Object.assign(book, updateBookDto);

  return this.booksRepository.save(book);
}

async deleteBook(id: string) {
  const book = await this.booksRepository.findOne({
    where: {
      openlibrary_work_id: id,
    },
  });

  if (!book) {
    throw new NotFoundException(
      `Book ${id} not found`,
    );
  }

  const copyCount = await this.copiesRepository.count({
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

async findOne(id: string) {
  const book = await this.booksRepository.findOne({
    where: {
      openlibrary_work_id: id,
    },
    relations: {
      category: true,
      copies: true,
    },
  });

  if (!book) {
    throw new NotFoundException(`Book ${id} not found`);
  }

  const totalCopies = book.copies.length;

  const availableCopies = book.copies.filter(
    (copy) => copy.status === 'AVAILABLE',
  ).length;

  return {
    ...book,
    totalCopies,
    availableCopies,
  };
}

async findAuthorsByBook(
  id: string,
): Promise<Author[]> {
  const book = await this.booksRepository.findOne({
    where: {
      openlibrary_work_id: id,
    },
  });

  if (!book) {
    throw new NotFoundException(
      `Book ${id} not found`,
    );
  }

  const bookAuthors =
    await this.bookAuthorsRepository.find({
      where: {
        openlibrary_work_id: id,
      },
    });

  const authorIds = bookAuthors.map(
    (bookAuthor) => bookAuthor.author_id,
  );

  if (authorIds.length === 0) {
    return [];
  }

  return this.authorsRepository.find({
    where: authorIds.map((id) => ({
      author_id: id,
    })),
    order: {
      author_name: 'ASC',
    },
  });
}

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