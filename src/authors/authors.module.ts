import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Author } from './entities/author.entity';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

import { Book } from '../books/entities/book.entity';
import { BookAuthor } from '../books/entities/book-author.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Author,
      BookAuthor,
      Book
    ]),
  ],
  controllers: [
    AuthorsController,
  ],
  providers: [
    AuthorsService,
  ],
  exports: [
    AuthorsService,
  ],
})
export class AuthorsModule {}