import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Book } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Author } from '../authors/entities/author.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      BookAuthor,
      Author
    ]),
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}