import {
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';

import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CategoriesService } from './categories.service';
import { Category } from './entities/category.entity';
import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Categories')
@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
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
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
  @ApiOperation({
    summary: 'Get category by ID or name',
    description:
      'Returns a single category by ID, or by searching category names. A name is matched case-insensitively as a substring, so a partial name returns every category whose name contains it.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Category ID, or a name fragment to search (case-insensitive substring)',
    example: 142,
  })
  @ApiResponse({
    status: 200,
    description:
      'Category found. An ID match returns that single category; a name search returns an array of all categories whose name contains the given text.',
  })
  @ApiResponse({
    status: 404,
    description: 'Category not found',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.categoriesService.findOne(id);
  }
}