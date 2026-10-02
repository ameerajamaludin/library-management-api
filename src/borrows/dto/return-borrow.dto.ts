import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReturnBorrowDto {
  @ApiProperty({
    description:
      'Condition of the physical copy when returned. Required, and supplied independently of notes: the returns record stores the condition for every return and has no default.',
    example: 'GOOD',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  condition: string;

  @ApiPropertyOptional({
    description:
      'Optional notes about the returned copy. Supplied independently: omit it to return a copy with no notes, and the condition is still recorded as given.',
    example: 'Returned in good condition.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}