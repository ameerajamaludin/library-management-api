import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  })
  @IsString()
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'Six not-so-easy pieces',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'A collection of lectures on physics.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 6,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  published_month?: number;

  @ApiPropertyOptional({
    example: 1997,
  })
  @IsOptional()
  @IsInt()
  published_year?: number;

  @ApiProperty({
    example: 142,
  })
  @IsInt()
  category_id: number;

  @ApiPropertyOptional({
    example: 'Nonfiction',
  })
  @IsOptional()
  @IsString()
  fiction_nonfiction?: string;

  @ApiPropertyOptional({
    example: '9780465025268',
  })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional({
  example: 'ACTIVE',
  enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  default: 'ACTIVE',
})
@IsOptional()
@IsIn(['ACTIVE', 'INACTIVE', 'ARCHIVED'])
status?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_s.jpg',
  })
  @IsOptional()
  @IsString()
  cover_image_small?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_m.jpg',
  })
  @IsOptional()
  @IsString()
  cover_image_medium?: string;

  @ApiPropertyOptional({
    example: '\\cover_image\\OL514625W_l.jpg',
  })
  @IsOptional()
  @IsString()
  cover_image_large?: string;

  
}