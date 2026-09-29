import {
  Controller,
  Get,
  Param,
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
import { BooksQueryDto } from './dto/books-query.dto';
import { Author } from '../authors/entities/author.entity';

@ApiTags('Books')
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

@Get()
@ApiOperation({
  summary: 'List books',
  description: 'Returns a paginated list of books with optional search and filtering.',
})
@ApiQuery({
  name: 'search',
  required: false,
  description: 'Search title or description',
  example: 'feynman',
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

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Book> {
    return this.booksService.findOne(id);
  }

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
}