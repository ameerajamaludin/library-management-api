import {
  Body,
  Controller,
  Delete,
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

import { FinesService } from './fines.service';

import { CreateFineDto } from './dto/create-fine.dto';
import { UpdateFineDto } from './dto/update-fine.dto';

@ApiTags('Fines')
@Controller('fines')
export class FinesController {
  constructor(
    private readonly finesService: FinesService,
  ) {}

  // ==========================================
  // POST /fines
  // ==========================================

  @Post()
  @ApiOperation({
    summary: 'Create a fine',
    description:
      'Creates a fine associated with a borrow record.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Fine created successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Borrow not found.',
  })
  async create(
    @Body()
    createFineDto: CreateFineDto,
  ) {
    return this.finesService.create(
      createFineDto,
    );
  }

  // ==========================================
  // GET /fines
  // ==========================================

  @Get()
  @ApiOperation({
    summary: 'List fines',
    description:
      'Returns all fines with copy, user, and book information.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of fines.',
  })
  async findAll() {
    return this.finesService.findAll();
  }

  // ==========================================
  // GET /fines/borrow/:borrowId
  // ==========================================

  @Get('borrow/:borrowId')
  @ApiOperation({
    summary: 'Get fines for a borrow',
    description:
      'Returns all fines associated with a borrow record.',
  })
  @ApiParam({
    name: 'borrowId',
    description: 'Borrow ID',
    example: 6,
  })
  @ApiResponse({
    status: 200,
    description:
      'Fines associated with the borrow.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Borrow not found.',
  })
  async findByBorrowId(
    @Param(
      'borrowId',
      ParseIntPipe,
    )
    borrowId: number,
  ) {
    return this.finesService.findByBorrowId(
      borrowId,
    );
  }

  // ==========================================
  // PATCH /fines/:id/pay
  // ==========================================

  @Patch(':id/pay')
  @ApiOperation({
    summary: 'Pay a fine',
    description:
      'Marks a fine as PAID and records the payment date and time automatically.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Fine paid successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Fine not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Fine has already been paid.',
  })
  async pay(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.finesService.pay(id);
  }

  // ==========================================
  // GET /fines/:id
  // ==========================================

  @Get(':id')
  @ApiOperation({
    summary: 'Get fine details',
    description:
      'Returns fine details including copy, user, and book information.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Fine details.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Fine not found.',
  })
  async findOne(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.finesService.findOne(id);
  }

  // ==========================================
  // PATCH /fines/:id
  // ==========================================

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a fine',
    description:
      'Updates fine amount, reason, status, or paid date.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Fine updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Fine not found.',
  })
  async update(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,

    @Body()
    updateFineDto: UpdateFineDto,
  ) {
    return this.finesService.update(
      id,
      updateFineDto,
    );
  }

  // ==========================================
  // DELETE /fines/:id
  // ==========================================

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a fine',
    description:
      'Deletes an existing fine.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description:
      'Fine deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description:
      'Fine not found.',
  })
  async remove(
    @Param(
      'id',
      ParseIntPipe,
    )
    id: number,
  ) {
    return this.finesService.remove(id);
  }
}