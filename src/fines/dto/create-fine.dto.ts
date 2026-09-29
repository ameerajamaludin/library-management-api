import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class CreateFineDto {
  @ApiProperty({
    description: 'Borrow ID associated with this fine.',
    example: 6,
  })
  @IsNumber()
  @IsNotEmpty()
  borrow_id: number;

  @ApiProperty({
    description: 'Fine amount.',
    example: 5.0,
  })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiProperty({
    description: 'Reason for the fine.',
    example: 'Late return',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  reason: string;

  @ApiProperty({
    description: 'Fine payment status.',
    example: 'UNPAID',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  status: string;

  @ApiPropertyOptional({
    description: 'Date and time when the fine was paid.',
    example: '2026-09-30T10:30:00.000Z',
  })
  @IsOptional()
  paid_at?: Date;
}