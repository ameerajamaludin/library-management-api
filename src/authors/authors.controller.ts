import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'List authors',
    description: 'Returns all authors.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of authors',
  })
  async findAll(): Promise<Author[]> {
    return this.authorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get an author',
    description: 'Returns an author by author ID.',
  })
  @ApiParam({
    name: 'id',
    description: 'Author ID',
    example: 'OL23919A',
  })
  @ApiResponse({
    status: 200,
    description: 'Author found',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  async findOne(
    @Param('id') id: string,
  ): Promise<Author> {
    return this.authorsService.findOne(id);
  }

  @Get(':id/books')
@ApiOperation({
  summary: 'Get books by author',
  description:
    'Returns all books associated with an author.',
})
@ApiParam({
  name: 'id',
  description: 'Author ID',
  example: 'OL23919A',
})
@ApiResponse({
  status: 200,
  description: 'Books written by the author',
})
@ApiResponse({
  status: 404,
  description: 'Author not found',
})
async findBooksByAuthor(
  @Param('id') id: string,
): Promise<Book[]> {
  return this.authorsService.findBooksByAuthor(id);
}
}