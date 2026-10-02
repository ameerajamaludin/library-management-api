import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateAuthorDto {
  @ApiPropertyOptional({
    example: 'Isaac Newton',
    description:
      'New author name. Optional, and supplied independently: send this field on its own to rename an author, and the author ID and every other attribute are left untouched.',
  })
  @IsOptional()
  @IsString()
  author_name?: string;
}
