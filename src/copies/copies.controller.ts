import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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

import { CopiesService } from './copies.service';

import {
  CopyBorrowResponseDto,
  CopyResponseDto,
} from './dto/copy-response.dto';

import { UpdateCopyDto } from './dto/update-copy.dto';
import { CreateCopyDto } from './dto/create-copy.dto';

import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Copies')
@Controller('copies')
export class CopiesController {
  constructor(
    private readonly copiesService: CopiesService,
  ) {}

  // ==========================================
  // GET /copies/:id/borrows
  // ==========================================

  @Get(':id/borrows')
  @UseGuards(
    UserIdGuard,
    RolesGuard,
  )
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Get copy borrowing history',
    description:
      'Returns the borrowing history for a physical copy.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Copy borrowing history',
    type: [CopyBorrowResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found',
  })
  async findBorrowHistory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.copiesService.findBorrowHistory(
      id,
    );
  }

  // ==========================================
  // GET /copies/:id
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
    summary: 'Get copy by ID or book name',
    description:
      'Returns a single copy by its copy ID, or by searching book titles. A book name is matched case-insensitively as a substring and returns every copy belonging to the matching books.',
  })
  @ApiParam({
    name: 'id',
    description:
      'Copy ID, or a book name fragment to search (case-insensitive substring)',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Copy details. A copy ID match returns that single copy; a book name search returns an array of every copy belonging to the matching books.',
    type: CopyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found',
  })
  async findOne(
    @Param('id') id: string,
  ) {
    return this.copiesService.findOne(id);
  }

  // ==========================================
  // POST /copies
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
    summary: 'Create copy',
    description:
      'Creates a new physical copy for an existing book. Each of the three fields is submitted as its own form field, and all three are required on their own because the copies table has no default for any of them: the work ID names the book the copy belongs to, the barcode identifies the copy and must be unique, and status is the state the new copy starts in. An existing copy is later edited one field at a time through PATCH /copies/{id}, where barcode and status are each optional and only the fields you send are changed.',
  })
  @ApiBody({
    type: CreateCopyDto,
  })
  @ApiResponse({
    status: 201,
    description:
      'Copy created successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Book not found.',
  })
  async create(
    @Body()
    createCopyDto: CreateCopyDto,
  ) {
    return this.copiesService.create(
      createCopyDto.openlibrary_work_id,
      createCopyDto.barcode,
      createCopyDto.status,
    );
  }

  // ==========================================
  // PATCH /copies/:id
  // ==========================================

  @Patch(':id')
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
    summary: 'Update copy',
    description:
      'Updates the status or barcode of a physical copy.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Copy updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Copy not found.',
  })
async update(
  id: number,
  updateCopyDto: UpdateCopyDto,
)  {
    return this.copiesService.update(
      id,
      updateCopyDto,
    );
  }


  // ==========================================
  // DELETE /copies/:id
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
    summary: 'Delete copy',
    description:
      'Deletes a physical copy from the library.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 6328,
  })
  @ApiResponse({
    status: 200,
    description:
      'Copy deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Copy not found.',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.copiesService.remove(id);
  }
}
