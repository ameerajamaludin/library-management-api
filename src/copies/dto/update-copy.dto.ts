import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateCopyDto {
  @ApiPropertyOptional({
    example: 'LIB-000001-UPDATED',
    description: 'New unique barcode for the physical copy',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  barcode?: string;

  @ApiPropertyOptional({
    example: 'AVAILABLE',
    description: 'New status for the copy',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsIn(['AVAILABLE', 'BORROWED'])
  status?: string;
}