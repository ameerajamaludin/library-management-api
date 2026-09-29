import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateCopyDto {
  @ApiProperty({
    example: 'BORROWED',
    description: 'New status for the copy',
  })
  @IsString()
  @IsNotEmpty()
  status: string;
}