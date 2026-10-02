import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { Author } from './entities/author.entity';
import { BookAuthor } from '../books/entities/book-author.entity';
import { Book } from '../books/entities/book.entity';
import { UpdateAuthorDto } from './dto/update-author.dto';

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

  async findOne(id: string) {
    const author = await this.authorsRepository.findOne({
      where: {
        author_id: id,
      },
    });

    if (author) {
      return author;
    }

    // ------------------------------------------
    // Fall back to a case-insensitive partial
    // author name search
    // ------------------------------------------

    const authors = await this.authorsRepository.find({
      where: {
        author_name: Raw(
          (alias) => `LOWER(${alias}) LIKE LOWER(:name)`,
          { name: `%${id}%` },
        ),
      },

      order: {
        author_name: 'ASC',
      },
    });

    if (authors.length === 0) {
      throw new NotFoundException(
        `Author ${id} not found`,
      );
    }

    return authors;
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

  async updateAuthor(
    id: string,
    updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
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

    if (updateAuthorDto.author_name !== undefined) {
      author.author_name = updateAuthorDto.author_name;
    }

    return this.authorsRepository.save(author);
  }
}