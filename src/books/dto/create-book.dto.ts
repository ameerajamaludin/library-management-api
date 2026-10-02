import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

import {
  IsInt,
  IsIn,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateBookDto {
  @ApiProperty({
    example: 'OL514625W',
    description:
      'Open Library work ID, the book identifier. Required.',
  })
  @IsString()
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'Six not-so-easy pieces',
    description:
      'Book title. Required.',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'A collection of lectures on physics.',
    description:
      'Book description. Optional.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 6,
    description:
      'Month of publication, 1-12. Optional.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  published_month?: number;

  @ApiPropertyOptional({
    example: 1997,
    description:
      'Year of publication. Optional.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  published_year?: number;

  @ApiProperty({
    example: 142,
    description:
      'ID of the category the book belongs to. Required.',
  })
  @Type(() => Number)
  @IsInt()
  category_id: number;

  @ApiPropertyOptional({
    example: 'Nonfiction',
    description:
      'Fiction or nonfiction classification. Optional.',
  })
  @IsOptional()
  @IsString()
  fiction_nonfiction?: string;

  @ApiPropertyOptional({
    example: '9780465025268',
    description:
      'Book ISBN. Optional.',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({
  example: 'ACTIVE',
  enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  default: 'ACTIVE',
  description:
    'Book lifecycle status. Optional, and defaults to ACTIVE when the book is created without one.',
})
@IsOptional()
@IsIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
status?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_s.jpg',
    description:
      'Path of the small cover image. Optional.',
  })
  @IsOptional()
  @IsString()
  cover_image_small?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_m.jpg',
    description:
      'Path of the medium cover image. Optional.',
  })
  @IsOptional()
  @IsString()
  cover_image_medium?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_l.jpg',
    description:
      'Path of the large cover image. Optional.',
  })
  @IsOptional()
  @IsString()
  cover_image_large?: string;

  
}