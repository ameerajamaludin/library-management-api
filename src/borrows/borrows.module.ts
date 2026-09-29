import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Borrow } from './entities/borrow.entity';
import { User } from '../users/entities/user.entity';
import { Copy } from '../copies/entities/copy.entity';
import { BorrowsService } from './borrows.service';
import { BorrowsController } from './borrows.controller';
import { Return } from '../returns/entities/return.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Borrow,
      User,
      Copy,
      Return,
    ]),
  ],
  controllers: [
    BorrowsController,
  ],
  providers: [
    BorrowsService,
  ],
  exports: [
    BorrowsService,
  ],
})
export class BorrowsModule {}