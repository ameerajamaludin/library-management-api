import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Category } from './entities/category.entity';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Category,
    ]),
    UsersModule,
  ],
  controllers: [
    CategoriesController,
  ],
  providers: [
    CategoriesService,
  ],
  exports: [
    CategoriesService,
  ],
})
export class CategoriesModule {}