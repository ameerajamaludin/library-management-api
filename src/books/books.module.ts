import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UsersModule } from '../users/users.module';

import { Book } from './entities/book.entity';
import { BookAuthor } from './entities/book-author.entity';
import { BooksController } from './books.controller';
import { BooksService } from './books.service';
import { Author } from '../authors/entities/author.entity';
import { Copy } from '../copies/entities/copy.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Book,
      BookAuthor,
      Author,
      Copy,
    ]),
    UsersModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
})
export class BooksModule {}