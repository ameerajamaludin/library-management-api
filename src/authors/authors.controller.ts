import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { AuthorsService } from './authors.service';
import { Author } from './entities/author.entity';
import { Book } from '../books/entities/book.entity';
import { UpdateAuthorDto } from './dto/update-author.dto';

import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Authors')
@Controller('authors')
export class AuthorsController {
  constructor(
    private readonly authorsService: AuthorsService,
  ) {}

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
    summary: 'Get author by ID or name',
    description:
      'Returns a single author by author ID, or by searching author names. A name is matched case-insensitively as a substring, so a partial name returns every author whose name contains it.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Author ID, or a name fragment to search (case-insensitive substring)',
    example: 'OL23919A',
  })
  @ApiResponse({
    status: 200,
    description:
      'Author found. An author ID match returns that single author; a name search returns an array of all authors whose name contains the given text.',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.authorsService.findOne(id);
  }

  @Get(':id/books')
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
    summary: 'Update an author',
    description:
      'Updates the name of an existing author. author_name is submitted as its own form field and is optional: send it on its own to rename the author, and the author ID and every other attribute are left untouched.',
  })
  @ApiBody({
    type: UpdateAuthorDto,
  })
  @ApiParam({
    name: 'id',
    description: 'Author ID',
    example: 'OL23919A',
  })
  @ApiResponse({
    status: 200,
    description: 'Author updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Author not found.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateAuthorDto: UpdateAuthorDto,
  ): Promise<Author> {
    return this.authorsService.updateAuthor(
      id,
      updateAuthorDto,
    );
  }
}