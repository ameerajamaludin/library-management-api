import {
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

import {
  ApiPropertyOptional,
} from '@nestjs/swagger';

export class UpdateFineDto {
  @ApiPropertyOptional({
    description: 'Fine amount.',
    example: 5.0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  amount?: number;

  @ApiPropertyOptional({
    description: 'Reason for the fine.',
    example: 'Late return',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  reason?: string;

  @ApiPropertyOptional({
    description: 'Fine payment status.',
    example: 'PAID',
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string;

  @ApiPropertyOptional({
    description: 'Date and time when the fine was paid.',
    example: '2026-09-30T10:30:00.000Z',
  })
  @IsOptional()
  paid_at?: Date | null;
}