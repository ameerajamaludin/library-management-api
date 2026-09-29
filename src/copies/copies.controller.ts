import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';

import {
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
import { UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
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
    description: 'Copy borrowing history',
    type: [CopyBorrowResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found',
  })
  async findBorrowHistory(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.copiesService.findBorrowHistory(id);
  }

  // ==========================================
  // GET /copies/:id
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get copy details',
    description:
      'Returns copy details, book information, and the current borrowing if the copy is currently borrowed.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Copy details',
    type: CopyResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.copiesService.findOne(id);
  }

  // ==========================================
  // PATCH /copies/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'Update copy',
    description:
      'Updates the status of a physical copy.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Copy updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found.',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCopyDto: UpdateCopyDto,
  ) {
    return this.copiesService.update(
      id,
      updateCopyDto.status,
    );
  }
}