import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import {
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BooksService } from './books.service';
import {
  BookListResponseDto,
  BookResponseDto,
} from './dto/book-response.dto';
import { CreateBookDto } from './dto/create-book.dto';
import { BooksQueryDto } from './dto/books-query.dto';
import { UpdateBookDto } from './dto/update-book.dto';
import { CopiesService } from '../copies/copies.service';
import { CreateBookCopyDto } from '../copies/dto/create-book-copy.dto';

import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(
    private readonly booksService: BooksService,
    private readonly copiesService: CopiesService,
  ) {}

  // ==========================================
  // GET /books
  // ==========================================

  @Get()
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
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
    description:
      'Filter by Fiction or Nonfiction',
    example: 'Nonfiction',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by book status',
    example: 'ACTIVE',
    enum: [
      'ACTIVE',
      'INACTIVE',
      'ARCHIVED',
    ],
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
    description:
      'Number of books per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of books',
    type: BookListResponseDto,
  })
  async findAll(
    @Query() query: BooksQueryDto,
  ) {
    return this.booksService.findAll(query);
  }

  // ==========================================
  // GET /books/:id
  // ==========================================

  @Get(':id')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
  @ApiOperation({
    summary: 'Get book by ID or name',
    description:
      'Returns a single book by its Open Library work ID, or by searching titles. A title is matched case-insensitively as a substring, so a partial title returns every book whose title contains it.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Open Library work ID, or a title fragment to search (case-insensitive substring)',
    example: 'OL514625W',
  })
  @ApiResponse({
    status: 200,
    description:
      'Book details. An Open Library work ID match returns that single book; a title search returns an array of all books whose title contains the given text.',
    type: BookResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.booksService.findOne(id);
  }

  // ==========================================
  // GET /books/status/:status
  // ==========================================

  @Get('status/:status')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
  @ApiOperation({
    summary: 'List books by status',
    description:
      'Returns books filtered by status.',
  })
  @ApiParam({
    name: 'status',
    description: 'Book status',
    enum: [
      'ACTIVE',
      'INACTIVE',
      'ARCHIVED',
    ],
    example: 'ACTIVE',
  })
  @ApiResponse({
    status: 200,
    description:
      'Books filtered by status',
  })
  async findByStatus(
    @Param('status') status: string,
  ) {
    return this.booksService.findByStatus(
      status,
    );
  }

  // ==========================================
  // POST /books
  // ==========================================

  @Post()
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description:
      'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Create a book',
    description:
      'Creates a new book in the library catalog. Each book field is submitted as its own form field. openlibrary_work_id, title and category_id are required; every other field is optional and can be left out, in which case the book is created without it. The same fields are individually editable one at a time through PATCH /books/{id}, which changes only the fields you send.',
  })
  @ApiBody({
    type: CreateBookDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Book created successfully.',
  })
  @ApiResponse({
    status: 409,
    description:
      'A book with this ID already exists.',
  })
  async create(
    @Body()
    createBookDto: CreateBookDto,
  ) {
    return this.booksService.createBook(
      createBookDto,
    );
  }

  // ==========================================
  // POST /books/:id/copies
  // ==========================================

  @Post(':id/copies')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description:
      'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Add a copy to a book',
    description:
      'Creates a new physical copy for an existing book. The book is identified by the id path parameter, so it is not part of the request body. The two remaining fields, barcode and status, are each submitted as their own form field and are both required: the barcode identifies the new copy and must be unique, and status is the state the copy starts in. An existing copy is later edited one field at a time through PATCH /copies/{id}, which changes only the fields you send.',
  })
  @ApiBody({
    type: CreateBookCopyDto,
  })
  @ApiParam({
    name: 'id',
    description:
      'Open Library work ID',
    example: 'OL514625W',
  })
  @ApiResponse({
    status: 201,
    description:
      'Copy created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found.',
  })
  async createCopy(
    @Param('id') id: string,
    @Body() createBookCopyDto: CreateBookCopyDto,
  ) {
    return this.copiesService.create(
      id,
      createBookCopyDto.barcode,
      createBookCopyDto.status,
    );
  }

  // ==========================================
  // PATCH /books/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description:
      'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Update a book',
    description:
      'Updates one or more fields of an existing book. Every book field is submitted as its own form field and every one of them is optional: send only the fields you want to change and each one is applied on its own, leaving all other fields of the book exactly as they are.',
  })
  @ApiBody({
    type: UpdateBookDto,
  })
  @ApiResponse({
    status: 200,
    description:
      'Book updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Book not found.',
  })
  async update(
    @Param('id') id: string,
    @Body()
    updateBookDto: UpdateBookDto,
    @Req() request: any,
  ) {
    return this.booksService.updateBook(
      id,
      updateBookDto,
      request.user.user_id,
    );
  }

  // ==========================================
  // DELETE /books/:id
  // ==========================================

  @Delete(':id')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description:
      'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Delete a book',
    description:
      'Deletes an existing book from the catalog.',
  })
  @ApiResponse({
    status: 200,
    description:
      'Book deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Book not found.',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.booksService.deleteBook(id);
  }
}
