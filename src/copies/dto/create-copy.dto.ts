import { ApiProperty } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateCopyDto {
  @ApiProperty({
    example: 'OL514625W',
    description:
      'Open Library work ID of the book this copy belongs to. Required: a copy cannot exist without the book it belongs to.',
  })
  @IsString()
  @IsNotEmpty()
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'BC000999',
    description:
      'Unique barcode for the physical copy. Required: the barcode identifies the copy and no two copies may share one.',
  })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({
    example: 'AVAILABLE',
    enum: ['AVAILABLE', 'BORROWED'],
    description:
      'Initial copy status. Required, and supplied independently of the other fields: the copies table stores a status for every copy and has no default, so a new copy is created in the status given here. Only these two values are accepted.',
  })
  @IsString()
  @IsNotEmpty()
  @IsIn(['AVAILABLE', 'BORROWED'])
  status: string;
}