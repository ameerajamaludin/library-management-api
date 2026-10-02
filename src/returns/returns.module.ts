import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Return } from './entities/return.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { ReturnsController } from './returns.controller';
import { ReturnsService } from './returns.service';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Return,
      Borrow,
    ]),
    UsersModule,
  ],

  controllers: [
    ReturnsController,
  ],

  providers: [
    ReturnsService,
  ],

  exports: [
    ReturnsService,
  ],
})
export class ReturnsModule {}