import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReturnBorrowDto {
  @ApiProperty({
    description: 'Condition of the physical copy when returned.',
    example: 'GOOD',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  condition: string;

  @ApiPropertyOptional({
    description: 'Optional notes about the returned copy.',
    example: 'Returned in good condition.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}