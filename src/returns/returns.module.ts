import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Return } from './entities/return.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Return,
      Borrow,
    ]),
  ],
})
export class ReturnsModule {}