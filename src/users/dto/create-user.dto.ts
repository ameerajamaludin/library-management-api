import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    example: 'L100',
    description:
      'Library user ID. Required.',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({
    example: 'Aminah binti Hassan',
    description: 'User name. Required.',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example:
      'aminah.hassan@perpustakaan.com',
    description:
      'User email address. Required.',
  })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 3,
    description:
      'ID of the role assigned to the user. Required.',
  })
  @Type(() => Number)
  @IsInt()
  role_id: number;
}
