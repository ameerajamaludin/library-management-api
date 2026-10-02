import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'Aminah binti Hassan',
    description:
      'New user name. Required.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'aminah.hassan@perpustakaan.com',
    description:
      'New user email address. Required.',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 3,
    description:
      'New role ID for the user. Required.',
  })
  @Type(() => Number)
  @IsInt()
  role_id: number;
}
