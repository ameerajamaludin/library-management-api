import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List categories',
    description: 'Returns all library categories.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of categories',
  })
  async findAll(): Promise<Category[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a category',
    description: 'Returns a category by ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Category ID',
    example: 142,
  })
  @ApiResponse({
    status: 200,
    description: 'Category found',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<Category> {
    return this.categoriesService.findOne(id);
  }
}