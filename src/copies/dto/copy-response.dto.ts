import { ApiProperty } from '@nestjs/swagger';

export class CopyBookResponseDto {
  @ApiProperty({
    example: 'OL514625W',
  })
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'Six Not-So-Easy Pieces',
  })
  title: string;

  @ApiProperty({
    example: '9780465025268',
    nullable: true,
  })
  isbn: string | null;
}

export class CopyUserResponseDto {
  @ApiProperty({
    example: 'L002',
  })
  user_id: string;

  @ApiProperty({
    example: 'Alisa binti Ibrahim',
  })
  name: string;

  @ApiProperty({
    example: 'alisa.ibrahim@perpustakaan.com',
  })
  email: string;
}

export class CopyBorrowResponseDto {
  @ApiProperty({
    example: 2,
  })
  borrow_id: number;

  @ApiProperty({
    example: 'L002',
  })
  user_id: string;

  @ApiProperty({
    type: CopyUserResponseDto,
  })
  user: CopyUserResponseDto;

  @ApiProperty({
    example: 1,
  })
  copy_id: number;

  @ApiProperty({
    example: '2026-09-29T22:52:47.557Z',
  })
  borrowed_at: Date;

  @ApiProperty({
    example: '2026-10-13T22:52:47.557Z',
  })
  due_at: Date;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  returned_at: Date | null;
}

export class CopyResponseDto {
  @ApiProperty({
    example: 1,
  })
  copy_id: number;

  @ApiProperty({
    example: 'LIB-000001',
  })
  barcode: string;

  @ApiProperty({
    example: 'BORROWED',
  })
  status: string;

  @ApiProperty({
    type: CopyBookResponseDto,
  })
  book: CopyBookResponseDto;

  @ApiProperty({
    type: CopyBorrowResponseDto,
    nullable: true,
  })
  currentBorrow: CopyBorrowResponseDto | null;
}