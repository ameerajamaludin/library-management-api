import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Raw, Repository } from 'typeorm';

import { Category } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category)
    private readonly categoriesRepository: Repository<Category>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoriesRepository.find({
      order: {
        sort_order: 'ASC',
        category_name: 'ASC',
      },
    });
  }

  async findOne(id: string) {
    const search = id.trim();

    const categoryId = Number(search);

    // ------------------------------------------
    // Exact category ID
    // ------------------------------------------

    if (
      search !== '' &&
      Number.isInteger(categoryId)
    ) {
      const category = await this.categoriesRepository.findOne({
        where: {
          category_id: categoryId,
        },
      });

      if (category) {
        return category;
      }
    }

    // ------------------------------------------
    // Fall back to a case-insensitive partial
    // category name search
    // ------------------------------------------

    if (search === '') {
      throw new NotFoundException(
        `Category ${id} not found`,
      );
    }

    const categories = await this.categoriesRepository.find({
      where: {
        category_name: Raw(
          (alias) => `LOWER(${alias}) LIKE LOWER(:name)`,
          { name: `%${search}%` },
        ),
      },
      order: {
        category_name: 'ASC',
      },
    });

    if (categories.length === 0) {
      throw new NotFoundException(
        `Category ${id} not found`,
      );
    }

    return categories;
  }
}