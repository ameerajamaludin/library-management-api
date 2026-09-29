import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateCopyDto {
  @ApiProperty({
    example: 'BC000999',
    description: 'Unique barcode for the physical copy',
  })
  @IsString()
  @IsNotEmpty()
  barcode: string;

  @ApiProperty({
    example: 'AVAILABLE',
    description: 'Current copy status',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}