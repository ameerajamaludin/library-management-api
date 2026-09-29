import {
  Body,
  Req,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Get,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { BorrowsService } from './borrows.service';
import { CreateBorrowDto } from './dto/create-borrow.dto';
import { BorrowResponseDto } from './dto/borrow-response.dto';
import { ReturnBorrowDto } from './dto/return-borrow.dto';
import { UseGuards } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Borrows')
@Controller('borrows')
export class BorrowsController {
  constructor(
    private readonly borrowsService: BorrowsService,
  ) {}


  // ==========================================
  // GET /borrows/overdue
  // ==========================================

  @Get('overdue')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'List overdue borrows',
    description:
      'Returns active borrows whose due date has passed.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of overdue borrows.',
    type: [BorrowResponseDto],
  })
  async findOverdue() {
    return this.borrowsService.findOverdue();
  }

  // ==========================================
  // POST /borrows
  // ==========================================

  @Post()
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Borrow a copy',
    description:
      'Borrows an available physical copy for a library user and changes the copy status to BORROWED.',
  })
  @ApiResponse({
    status: 201,
    description:
      'Borrowing created successfully.',
    type: BorrowResponseDto,
  })
  @ApiResponse({
    status: 404,
    description:
      'User or copy not found.',
  })
  @ApiResponse({
    status: 409,
    description:
      'Copy is not available.',
  })
  async create(
    @Body() createBorrowDto: CreateBorrowDto,
    @Req() request: any,
  ): Promise<BorrowResponseDto> {
    return this.borrowsService.create(
      createBorrowDto,
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // POST /borrows/copy/:copyId/return
  // ==========================================

@Post('copy/:copyId/return')
@UseGuards(UserIdGuard, RolesGuard)
@Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
@ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
@ApiOperation({
  summary: 'Return a copy',
  description:
    'Returns the active borrowing for a physical copy, records the return details, and changes the copy status to AVAILABLE.',
})
@ApiParam({
  name: 'copyId',
  description: 'Physical copy ID',
  example: 1,
})
@ApiResponse({
  status: 200,
  description:
    'Copy returned successfully.',
  type: BorrowResponseDto,
})
@ApiResponse({
  status: 404,
  description:
    'Copy not found.',
})
@ApiResponse({
  status: 409,
  description:
    'Copy has no active borrowing.',
})
async returnByCopyId(
  @Param(
    'copyId',
    ParseIntPipe,
  )
  copyId: number,

  @Body()
  returnBorrowDto: ReturnBorrowDto,
  @Req() request: any,
): Promise<BorrowResponseDto> {
  return this.borrowsService.returnByCopyId(
    copyId,
    returnBorrowDto,
    request.user.user_id,
    request.user.role.role_name,
  );
}
}