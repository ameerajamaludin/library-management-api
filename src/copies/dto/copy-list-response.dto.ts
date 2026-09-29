import { ApiProperty } from '@nestjs/swagger';

import { Copy } from '../entities/copy.entity';

export class CopyListResponseDto {
  @ApiProperty({
    example: {
      openlibrary_work_id: 'OL514625W',
      title: 'Six not-so-easy pieces',
    },
  })
  book: {
    openlibrary_work_id: string;
    title: string;
  };

  @ApiProperty({
    example: 3,
    description: 'Total number of physical copies',
  })
  totalCopies: number;

  @ApiProperty({
    example: 2,
    description: 'Number of copies currently available',
  })
  availableCopies: number;

  @ApiProperty({
    type: () => [Copy],
    description: 'Physical copies belonging to the book',
  })
  copies: Copy[];
}