import { ApiProperty } from '@nestjs/swagger';

// Mirrors the category relation returned alongside a book.
export class BookCategoryResponseDto {
  @ApiProperty({ example: 142 })
  category_id: number;

  @ApiProperty({ example: 142, nullable: true })
  category_parent_id: number | null;

  @ApiProperty({ example: 'Physics' })
  category_name: string;

  @ApiProperty({ example: 'physics' })
  category_slug: string;

  @ApiProperty({
    example: 'Books about physics',
    nullable: true,
  })
  category_description: string | null;

  @ApiProperty({ example: 0 })
  sort_order: number;

  @ApiProperty({ example: true })
  is_active: boolean;
}

// Mirrors the copies relation returned alongside a book.
export class BookCopyResponseDto {
  @ApiProperty({ example: 1 })
  copy_id: number;

  @ApiProperty({ example: 'OL514625W' })
  openlibrary_work_id: string;

  @ApiProperty({ example: 'LIB-000001' })
  barcode: string;

  @ApiProperty({
    example: 'AVAILABLE',
    enum: ['AVAILABLE', 'BORROWED'],
  })
  status: string;
}

// The book fields as stored. GET /books returns these entities
// inside its paginated envelope, without copy counts.
export class BookSummaryResponseDto {
  @ApiProperty({ example: 'OL514625W' })
  openlibrary_work_id: string;

  @ApiProperty({
    example: 'Six not-so-easy pieces',
  })
  title: string;

  @ApiProperty({
    example:
      'A collection of lectures on physics.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 6, nullable: true })
  published_month: number | null;

  @ApiProperty({ example: 1997, nullable: true })
  published_year: number | null;

  @ApiProperty({ example: 142 })
  category_id: number;

  @ApiProperty({
    example: 'Nonfiction',
    nullable: true,
  })
  fiction_nonfiction: string | null;

  @ApiProperty({
    example: '9780465025268',
    nullable: true,
  })
  isbn: string | null;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  })
  status: string;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_s.jpg',
    nullable: true,
  })
  cover_image_small: string | null;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_m.jpg',
    nullable: true,
  })
  cover_image_medium: string | null;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_l.jpg',
    nullable: true,
  })
  cover_image_large: string | null;

  @ApiProperty({
    example: 'L001',
    nullable: true,
  })
  updated_by: string | null;

  @ApiProperty({
    example: '2026-09-30T10:30:00.000Z',
    nullable: true,
  })
  updated_at: Date | null;
}

// GET /books returns a paginated envelope whose entries are
// book entities, so copy counts are not part of this response.
export class BookListResponseDto {
  @ApiProperty({
    type: () => [BookSummaryResponseDto],
  })
  data: BookSummaryResponseDto[];

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  limit: number;

  @ApiProperty({ example: 137 })
  total: number;

  @ApiProperty({ example: 7 })
  totalPages: number;
}

// Returned by GET /books/:id on an exact work ID match, in the
// same order BooksService.toBookResponse builds it. The copy
// counts are read from the already-loaded copies relation
// there; nothing is recomputed for the schema.
export class BookResponseDto {
  @ApiProperty({ example: 'OL514625W' })
  openlibrary_work_id: string;

  @ApiProperty({
    type: 'integer',
    description:
      'Total number of physical copies of this book.',
    example: 5,
  })
  totalCopies: number;

  @ApiProperty({
    type: 'integer',
    description:
      'Number of physical copies currently available to borrow.',
    example: 3,
  })
  availableCopies: number;

  @ApiProperty({
    example: 'Six not-so-easy pieces',
  })
  title: string;

  @ApiProperty({
    example: 'A collection of lectures on physics.',
    nullable: true,
  })
  description: string | null;

  @ApiProperty({ example: 6, nullable: true })
  published_month: number | null;

  @ApiProperty({ example: 1997, nullable: true })
  published_year: number | null;

  @ApiProperty({ example: 142 })
  category_id: number;

  @ApiProperty({
    example: 'Nonfiction',
    nullable: true,
  })
  fiction_nonfiction: string | null;

  @ApiProperty({
    example: '9780465025268',
    nullable: true,
  })
  isbn: string | null;

  @ApiProperty({
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  })
  status: string;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_s.jpg',
    nullable: true,
  })
  cover_image_small: string | null;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_m.jpg',
    nullable: true,
  })
  cover_image_medium: string | null;

  @ApiProperty({
    example: '\\cover_image\\OL514625W_l.jpg',
    nullable: true,
  })
  cover_image_large: string | null;

  @ApiProperty({
    example: 'L001',
    nullable: true,
  })
  updated_by: string | null;

  @ApiProperty({
    example: '2026-09-30T10:30:00.000Z',
    nullable: true,
  })
  updated_at: Date | null;

  @ApiProperty({
    type: () => BookCategoryResponseDto,
  })
  category: BookCategoryResponseDto;

  @ApiProperty({
    type: () => [BookCopyResponseDto],
  })
  copies: BookCopyResponseDto[];
}