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
import { UseGuards, Req } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

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
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
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
  @ApiResponse({
    status: 409,
    description:
      'A fine already exists for this borrow.',
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
  // POST /fines/overdue/:borrowId
  // ==========================================

  @Post('overdue/:borrowId')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Create an overdue fine',
    description:
      'Calculates and creates one fine for an overdue borrow. The amount is calculated as overdue days multiplied by FINE_PER_DAY.',
  })
  @ApiParam({
    name: 'borrowId',
    description: 'Borrow ID',
    example: 6,
  })
  @ApiResponse({
    status: 201,
    description: 'Overdue fine created successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Borrow not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Borrow is not overdue or already has a fine.',
  })
  async createForOverdueBorrow(
    @Param('borrowId', ParseIntPipe) borrowId: number,
  ) {
    return this.finesService.createForOverdueBorrow(
      borrowId,
    );
  }

  // ==========================================
  // GET /fines
  // ==========================================

  @Get()
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'List fines',
    description:
      'Returns all fines with related borrowing, user, copy, and book information.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of fines.',
  })
  async findAll(
    @Req() request: any,
  ) {
    return this.finesService.findAll(
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // GET /fines/borrow/:borrowId
  // ==========================================

  @Get('borrow/:borrowId')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
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
    @Req() request: any,
  ) {
    return this.finesService.findByBorrowId(
      borrowId,
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // GET /fines/:id
  // ==========================================

  @Get(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Get fine details',
    description:
      'Returns fine details including user, copy, and book information.',
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
    @Req() request: any,
  ) {
    return this.finesService.findOne(
      id,
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // POST /fines/:id/pay
  // ==========================================

  @Post(':id/pay')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Pay a fine',
    description: 'Marks a fine as PAID. Members can only pay their own fines.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Fine paid successfully.',
  })
  async pay(
    @Param('id', ParseIntPipe) id: number,
    @Req() request: any,
  ) {
    return this.finesService.pay(
      id,
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // PATCH /fines/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
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
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
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