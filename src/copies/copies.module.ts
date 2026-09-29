import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Copy } from './entities/copy.entity';
import { Book } from '../books/entities/book.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { CopiesController } from './copies.controller';
import { CopiesService } from './copies.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Copy,
      Book,
      Borrow,
    ]),
    UsersModule,
  ],
  controllers: [
    CopiesController
  ],
  providers: [
    CopiesService
  ],
  exports: [
    CopiesService
  ],
})
export class CopiesModule {}