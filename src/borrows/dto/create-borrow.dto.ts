import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateBorrowDto {
  @ApiProperty({
    example: 'L002',
    description: 'Library user ID',
  })
  @IsString()
  user_id: string;

  @ApiProperty({
    example: 1,
    description: 'Physical copy ID',
  })
  @IsInt()
  copy_id: number;
}