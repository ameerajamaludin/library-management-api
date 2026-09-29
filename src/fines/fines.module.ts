import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Fine } from './entities/fine.entity';
import { Borrow } from '../borrows/entities/borrow.entity';

import { FinesService } from './fines.service';
import { FinesController } from './fines.controller';

import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Fine,
      Borrow,
    ]),
    UsersModule
  ],

  controllers: [
    FinesController,
  ],

  providers: [
    FinesService,
  ],

  exports: [
    FinesService,
  ],
})
export class FinesModule {}