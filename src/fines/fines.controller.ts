import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseInterceptors,
} from '@nestjs/common';
import { AnyFilesInterceptor } from '@nestjs/platform-express';

import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { FinesService } from './fines.service';
import {
  FineDeleteResponseDto,
  FineRecordResponseDto,
  FineResponseDto,
  FineWithBorrowResponseDto,
} from './dto/fine-response.dto';
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
    type: [FineWithBorrowResponseDto],
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
    type: [FineWithBorrowResponseDto],
  })
  @ApiResponse({
    status: 403,
    description:
      'Members can only access fines for their own borrows.',
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
  @Roles('ADMIN', 'LIBRARIAN')
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
    type: FineResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Members can only access their own fines.',
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
      'Calculates and creates one fine for an overdue borrow.\n\n' +
      '**This endpoint takes no request body.** The borrow is identified solely by the borrowId path parameter, and every field on the created fine is calculated or fixed server-side from the overdue and fine rules. Nothing about the fine can be supplied or overridden by the caller.\n\n' +
      '**amount and overdue_days are calculated automatically.** overdue_days is the number of completed 24-hour periods elapsed after the borrow due date, and amount is that day count multiplied by the RM2 daily fine rate — a borrow that is 3 days overdue produces overdue_days 3 and amount 6. Neither is read from the request.\n\n' +
      '**The created fine always starts as UNPAID.** On creation status is set to UNPAID, paid_at and paid_by are null, and reason is fixed as "Late return". A fine only becomes PAID later, through POST /fines/{id}/pay, which records the payer and the payment time.\n\n' +
      'Calling this again for the same borrow is safe and does not create a second fine: an existing unpaid fine is recalculated against the current day count, and an already-paid fine is returned exactly as paid so its amount stops accumulating.',
  })
  @ApiParam({
    name: 'borrowId',
    description:
      'Borrow ID of the overdue borrow to raise the fine for. The borrow must be at least one full day past its due date, otherwise the request is rejected with 409.',
    example: 6,
  })
  @ApiResponse({
    status: 201,
    description:
      'The fine for the borrow. It is returned in its freshly created state: status is UNPAID, paid_at and paid_by are null, and amount and overdue_days hold the values calculated from the borrow due date. Repeat calls for the same borrow return that same fine rather than creating another one.',
    type: FineResponseDto,
    example: {
      fine_id: 1,
      borrow_id: 6,
      amount: 6,
      overdue_days: 3,
      reason: 'Late return',
      status: 'UNPAID',
      paid_at: null,
      paid_by: null,
      user: {
        user_id: 'L002',
        name: 'Alisa binti Ibrahim',
        email: 'alisa.ibrahim@perpustakaan.com',
      },
      copy: {
        copy_id: 1,
        barcode: 'LIB-000001',
        status: 'BORROWED',
      },
      book: {
        openlibrary_work_id: 'OL514625W',
        title: 'Six Not-So-Easy Pieces',
        isbn: '9780465025268',
      },
      paid_by_user: null,
    },
  })
  @ApiResponse({
    status: 404,
    description:
      'No borrow exists with the given borrowId.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The borrow is not overdue. A borrow becomes overdue only once a full 24-hour day has passed since its due date, so a borrow that is on time or less than a day late is rejected and no fine is created.',
  })
  async createForOverdueBorrow(
    @Param('borrowId', ParseIntPipe) borrowId: number,
  ) {
    return this.finesService.createForOverdueBorrow(
      borrowId,
    );
  }

  // ==========================================
  // PATCH /fines/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'Update a fine',
    description:
      'Updates fine amount, reason, status, or paid date. Each of the four fields is submitted as its own form field and every one of them is optional: send only the fields you want to change, and each is applied on its own while every other field of the fine keeps its current value. Leave a field out entirely to keep it unchanged.',
  })
  @ApiBody({
    type: UpdateFineDto,
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
    type: FineRecordResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'Fine not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'A fine cannot be set to PAID without recording a payer. Pay the fine through POST /fines/:id/pay instead.',
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
    type: FineDeleteResponseDto,
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
  // ==========================================
  // POST /fines/:id/pay
  // ==========================================

  @Post(':id/pay')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Pay a fine',
    description: 'Marks a fine as PAID, recording the payer in paid_by and the payment timestamp in paid_at. Members can only pay their own fines. This endpoint takes no request body: the fine is identified by the id path parameter and every field is derived server-side — status becomes PAID, paid_at is the time of the request, and paid_by is the authenticated user, so an ADMIN or LIBRARIAN paying on behalf of a member is attributed to that staff member. The payer cannot be supplied from the request body because the payment must always be attributable to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    description: 'Fine ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Fine paid successfully.',
    type: FineResponseDto,
  })
  @ApiResponse({
    status: 403,
    description:
      'Members can only pay their own fines.',
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

}
