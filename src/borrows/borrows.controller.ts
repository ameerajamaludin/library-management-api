import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Post,
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

@ApiTags('Borrows')
@Controller('borrows')
export class BorrowsController {
  constructor(
    private readonly borrowsService: BorrowsService,
  ) {}

  // ==========================================
  // POST /borrows
  // ==========================================

  @Post()
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
  ): Promise<BorrowResponseDto> {
    return this.borrowsService.create(
      createBorrowDto,
    );
  }

  // ==========================================
  // POST /borrows/copy/:copyId/return
  // ==========================================

@Post('copy/:copyId/return')
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
): Promise<BorrowResponseDto> {
  return this.borrowsService.returnByCopyId(
    copyId,
    returnBorrowDto,
  );
}
}