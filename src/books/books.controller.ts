import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BooksService } from './books.service';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/create-book.dto';
import { BooksQueryDto } from './dto/books-query.dto';
import { UpdateBookDto } from './dto/update-book.dto';

import { Author } from '../authors/entities/author.entity';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
  ) {}

  // ==========================================
  // GET /books
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'List books',
    description:
      'Returns a paginated list of books with optional search and filtering.',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search title or description',
    example: 'feynman',
  })
  @ApiQuery({
    name: 'isbn',
    required: false,
    description: 'Search books by ISBN',
    example: '9780465025268',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
    example: 142,
  })
  @ApiQuery({
    name: 'fictionNonfiction',
    required: false,
    description: 'Filter by Fiction or Nonfiction',
    example: 'Nonfiction',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by book status',
    example: 'ACTIVE',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of books per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of books',
  })
  async findAll(@Query() query: BooksQueryDto) {
    return this.booksService.findAll(query);
  }

  // ==========================================
  // GET /books/status/:status
  // ==========================================

  @Get('status/:status')
  @ApiOperation({
    summary: 'List books by status',
    description: 'Returns books filtered by status.',
  })
  @ApiParam({
    name: 'status',
    description: 'Book status',
    enum: ['ACTIVE', 'INACTIVE', 'ARCHIVED'],
    example: 'ACTIVE',
  })
  @ApiResponse({
    status: 200,
    description: 'Books filtered by status',
  })
  async findByStatus(
    @Param('status') status: string,
  ) {
    return this.booksService.findByStatus(status);
  }

  // ==========================================
  // POST /books
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create a book',
    description: 'Creates a new book in the library catalog.',
  })
  @ApiResponse({
    status: 201,
    description: 'Book created successfully.',
  })
  @ApiResponse({
    status: 409,
    description: 'A book with this ID already exists.',
  })
  async create(
    @Body() createBookDto: CreateBookDto,
  ) {
    return this.booksService.createBook(
      createBookDto,
    );
  }

  // ==========================================
  // GET /books/:id
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get book by ID',
    description: 'Returns a single book by its Open Library work ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Open Library work ID',
    example: 'OL514625W',
  })
  @ApiResponse({
    status: 200,
    description: 'Book found',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<Book> {
    return this.booksService.findOne(id);
  }

  // ==========================================
  // GET /books/:id/authors
  // ==========================================

  @Get(':id/authors')
  @ApiOperation({
    summary: 'Get authors of a book',
    description:
      'Returns all authors associated with a book.',
  })
  @ApiParam({
    name: 'id',
    description: 'Open Library work ID',
    example: 'OL514625W',
  })
  @ApiResponse({
    status: 200,
    description: 'Authors of the book',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async findAuthorsByBook(
    @Param('id') id: string,
  ): Promise<Author[]> {
    return this.booksService.findAuthorsByBook(id);
  }

  // ==========================================
  // PATCH /books/:id
  // ==========================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a book',
    description:
      'Updates one or more fields of an existing book.',
  })
  @ApiResponse({
    status: 200,
    description: 'Book updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateBookDto: UpdateBookDto,
  ) {
    return this.booksService.updateBook(
      id,
      updateBookDto,
    );
  }

  // ==========================================
  // DELETE /books/:id
  // ==========================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a book',
    description:
      'Deletes an existing book from the catalog.',
  })
  @ApiResponse({
    status: 200,
    description: 'Book deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found.',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.booksService.deleteBook(id);
  }
}