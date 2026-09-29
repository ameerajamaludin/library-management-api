import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class BooksQueryDto {
  @ApiPropertyOptional({
    example: 'feynman',
    description: 'Search title or description',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    example: '9780465025268',
    description: 'Search books by ISBN',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @IsOptional()
@IsIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
status?: string;

  @ApiPropertyOptional({
    example: 142,
    description: 'Filter by category ID',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  categoryId?: number;

  @ApiPropertyOptional({
    example: 'Nonfiction',
    description: 'Filter by Fiction or Nonfiction',
  })
  @IsOptional()
  @IsString()
  fictionNonfiction?: string;

  @ApiPropertyOptional({
    example: 1,
    default: 1,
    description: 'Page number',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({
    example: 20,
    default: 20,
    description: 'Number of books per page',
  })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}