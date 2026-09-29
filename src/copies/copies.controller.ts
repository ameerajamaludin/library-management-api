import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { CopiesService } from './copies.service';
import { Copy } from './entities/copy.entity';
import { CreateCopyDto } from './dto/create-copy.dto';
import { UpdateCopyDto } from './dto/update-copy.dto';
import { CopyListResponseDto } from './dto/copy-list-response.dto';

@ApiTags('Copies')
@Controller()
export class CopiesController {
  constructor(
    private readonly copiesService: CopiesService,
  ) {}

  @Get('books/:id/copies')
  @ApiOperation({
    summary: 'List copies of a book',
    description:
      'Returns all physical copies belonging to a book.',
  })
  @ApiParam({
    name: 'id',
    description: 'OpenLibrary work ID',
    example: 'OL514625W',
  })
@ApiResponse({
  status: 200,
  description: 'List of copies with total and available counts',
  type: CopyListResponseDto,
})
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
async findByBook(
  @Param('id') id: string,
): Promise<CopyListResponseDto> {
  return this.copiesService.findByBook(id);
}

  @Post('books/:id/copies')
  @ApiOperation({
    summary: 'Add a copy to a book',
    description:
      'Creates a new physical copy for a book.',
  })
  @ApiParam({
    name: 'id',
    description: 'OpenLibrary work ID',
    example: 'OL514625W',
  })
  @ApiResponse({
    status: 201,
    description: 'Copy created',
  })
  @ApiResponse({
    status: 404,
    description: 'Book not found',
  })
  async create(
    @Param('id') id: string,
    @Body() dto: CreateCopyDto,
  ): Promise<Copy> {
    return this.copiesService.create(
      id,
      dto.barcode,
      dto.status,
    );
  }

  @Patch('copies/:id')
  @ApiOperation({
    summary: 'Update copy status',
    description:
      'Updates the status of a physical book copy.',
  })
  @ApiParam({
    name: 'id',
    description: 'Copy ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Copy updated',
  })
  @ApiResponse({
    status: 404,
    description: 'Copy not found',
  })
  async update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
    @Body() dto: UpdateCopyDto,
  ): Promise<Copy> {
    return this.copiesService.update(
      id,
      dto.status,
    );
  }
}