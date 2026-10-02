import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateBorrowDto {
  @ApiPropertyOptional({
    example: 'L002',
    description:
      'Library user ID to borrow on behalf of. Optional, and supplied independently: omit it to borrow for yourself, which is the authenticated user making the request. ADMIN and LIBRARIAN may pass another user ID to borrow on that user\'s behalf; a MEMBER passing anyone other than themselves is rejected.',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  user_id?: string;

  @ApiProperty({
    example: 1,
    description:
      'Physical copy ID to borrow. Required.',
  })
  @Type(() => Number)
  @IsInt()
  copy_id: number;
}