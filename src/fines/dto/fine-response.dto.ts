import { ApiProperty } from '@nestjs/swagger';

export class FineUserResponseDto {
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

export class FineCopyResponseDto {
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
}

export class FineBookResponseDto {
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

export class FineBorrowResponseDto {
  @ApiProperty({
    example: 2,
  })
  borrow_id: number;

  @ApiProperty({
    example: 'L002',
  })
  user_id: string;

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

  @ApiProperty({
    type: FineUserResponseDto,
  })
  user: FineUserResponseDto;

  @ApiProperty({
    type: FineCopyResponseDto,
  })
  copy: FineCopyResponseDto;

  @ApiProperty({
    type: FineBookResponseDto,
  })
  book: FineBookResponseDto;
}

// The stored fine record itself, without any
// borrowing relations. Returned by PATCH /fines/:id.
export class FineRecordResponseDto {
  @ApiProperty({
    example: 1,
  })
  fine_id: number;

  @ApiProperty({
    example: 2,
  })
  borrow_id: number;

  @ApiProperty({
    example: 6,
    description:
      'Calculated as overdue_days multiplied by the RM2 daily fine rate.',
  })
  amount: number;

  @ApiProperty({
    example: 3,
    description:
      'Completed 24-hour periods elapsed after the borrow due date that the amount was calculated from. Derived from the overdue calculation and not settable through PATCH /fines/:id.',
  })
  overdue_days: number;

  @ApiProperty({
    example: 'Late return',
  })
  reason: string;

  @ApiProperty({
    example: 'UNPAID',
  })
  status: string;

  @ApiProperty({
    example: null,
    nullable: true,
  })
  paid_at: Date | null;

  // The library user who settled the fine, kept as an
  // audit trail. Deliberately not a foreign key so
  // removing a user can never fail because of the
  // payments they recorded.
  @ApiProperty({
    example: null,
    nullable: true,
    description:
      'Library user ID of whoever paid the fine. Recorded when the payment occurs, so it stays null on unpaid fines.',
  })
  paid_by: string | null;
}

// Returned by GET /fines and GET /fines/borrow/:borrowId,
// which return the fine together with its borrow.
export class FineWithBorrowResponseDto
  extends FineRecordResponseDto
{
  @ApiProperty({
    type: FineUserResponseDto,
    nullable: true,
    description:
      'Profile of the user recorded in paid_by. Null while the fine is unpaid, or if that user has since been deleted; paid_by itself is always kept.',
  })
  paid_by_user: FineUserResponseDto | null;

  @ApiProperty({
    type: FineBorrowResponseDto,
  })
  borrow: FineBorrowResponseDto;
}

// Returned by DELETE /fines/:id.
export class FineDeleteResponseDto {
  @ApiProperty({
    example: 'Fine 1 deleted successfully',
  })
  message: string;
}

// Returned by GET /fines/:id,
// POST /fines/overdue/:borrowId and POST /fines/:id/pay,
// which flatten the user, copy and book onto the fine.
export class FineResponseDto
  extends FineRecordResponseDto
{
  @ApiProperty({
    type: FineUserResponseDto,
    nullable: true,
  })
  user: FineUserResponseDto | null;

  @ApiProperty({
    type: FineCopyResponseDto,
    nullable: true,
  })
  copy: FineCopyResponseDto | null;

  @ApiProperty({
    type: FineBookResponseDto,
    nullable: true,
  })
  book: FineBookResponseDto | null;

  @ApiProperty({
    type: FineUserResponseDto,
    nullable: true,
    description:
      'Profile of the user recorded in paid_by. Null while the fine is unpaid, or if that user has since been deleted; paid_by itself is always kept.',
  })
  paid_by_user: FineUserResponseDto | null;
}