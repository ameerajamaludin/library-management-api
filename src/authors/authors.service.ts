import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Author } from './entities/author.entity';
import { BookAuthor } from '../books/entities/book-author.entity';
import { Book } from '../books/entities/book.entity';

@Injectable()
export class AuthorsService {
  constructor(
    @InjectRepository(Author)
    private readonly authorsRepository: Repository<Author>,

    @InjectRepository(BookAuthor)
    private readonly bookAuthorsRepository: Repository<BookAuthor>,

    @InjectRepository(Book)
    private readonly booksRepository: Repository<Book>,
  ) {}

  async findAll(): Promise<Author[]> {
    return this.authorsRepository.find({
      order: {
        author_name: 'ASC',
      },
    });
  }

  async findOne(id: string): Promise<Author> {
    const author = await this.authorsRepository.findOne({
      where: {
        author_id: id,
      },
    });

    if (!author) {
      throw new NotFoundException(
        `Author ${id} not found`,
      );
    }

    return author;
  }

  async findBooksByAuthor(
    id: string,
  ): Promise<Book[]> {
    const author = await this.authorsRepository.findOne({
      where: {
        author_id: id,
      },
    });

    if (!author) {
      throw new NotFoundException(
        `Author ${id} not found`,
      );
    }

    const bookAuthors =
      await this.bookAuthorsRepository.find({
        where: {
          author_id: id,
        },
      });

    const bookIds = bookAuthors.map(
      (bookAuthor) =>
        bookAuthor.openlibrary_work_id,
    );

    if (bookIds.length === 0) {
      return [];
    }

    return this.booksRepository.find({
      where: bookIds.map((id) => ({
        openlibrary_work_id: id,
      })),
      order: {
        title: 'ASC',
      },
    });
  }
}