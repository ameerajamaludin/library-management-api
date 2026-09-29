import { ApiProperty } from '@nestjs/swagger';

export class BorrowUserResponseDto {
  @ApiProperty({ example: 'L002' })
  user_id: string;

  @ApiProperty({ example: 'Alisa binti Ibrahim' })
  name: string;

  @ApiProperty({ example: 'alisa.ibrahim@perpustakaan.com' })
  email: string;
}

export class BorrowCopyResponseDto {
  @ApiProperty({ example: 1 })
  copy_id: number;

  @ApiProperty({ example: 'LIB-000001' })
  barcode: string;

  @ApiProperty({ example: 'BORROWED' })
  status: string;
}

export class BorrowBookResponseDto {
  @ApiProperty({ example: 'OL514625W' })
  openlibrary_work_id: string;

  @ApiProperty({ example: 'Six Not-So-Easy Pieces' })
  title: string;

  @ApiProperty({
    example: '9780465025268',
    nullable: true,
  })
  isbn: string | null;
}

export class BorrowReturnResponseDto {
  @ApiProperty({ example: 1 })
  return_id: number;

  @ApiProperty({ example: 6 })
  borrow_id: number;

  @ApiProperty({ example: '2026-09-29T16:28:22.403Z' })
  returned_at: Date;

  @ApiProperty({ example: 'GOOD' })
  condition: string;

  @ApiProperty({
    example: 'Returned in good condition.',
    nullable: true,
  })
  notes: string | null;
}

export class BorrowFineResponseDto {
  @ApiProperty({ example: 1 })
  fine_id: number;

  @ApiProperty({ example: 5.0 })
  amount: number;

  @ApiProperty({ example: 'Late return' })
  reason: string;

  @ApiProperty({ example: 'UNPAID' })
  status: string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  paid_at: Date | null;
}

export class BorrowResponseDto {
  @ApiProperty({ example: 2 })
  borrow_id: number;

  @ApiProperty({ example: 'L002' })
  user_id: string;

  @ApiProperty({ type: BorrowUserResponseDto })
  user: BorrowUserResponseDto;

  @ApiProperty({ example: 1 })
  copy_id: number;

  @ApiProperty({ type: BorrowCopyResponseDto })
  copy: BorrowCopyResponseDto;

  @ApiProperty({ type: BorrowBookResponseDto })
  book: BorrowBookResponseDto;

  @ApiProperty({ example: '2026-09-29T22:52:47.557Z' })
  borrowed_at: Date;

  @ApiProperty({ example: '2026-10-13T22:52:47.557Z' })
  due_at: Date;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  returned_at: Date | null;

  @ApiProperty({
    type: BorrowReturnResponseDto,
    nullable: true,
  })
  returnRecord: BorrowReturnResponseDto | null;

  @ApiProperty({
    type: [BorrowFineResponseDto],
  })
  fines: BorrowFineResponseDto[];
}
