import {
  Body,
  Req,
  Controller,
  Param,
  ParseIntPipe,
  Post,
  Get,
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
  // GET /borrows/own
  // ==========================================

  @Get('own')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
  @ApiOperation({
    summary: 'List own borrowed books',
    description:
      'Returns the borrowing records belonging to the requesting user.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of borrows belonging to the requesting user.',
    type: [BorrowResponseDto],
  })
  async findOwn(
    @Req() request: any,
  ): Promise<BorrowResponseDto[]> {
    return this.borrowsService.findByUser(
      request.user.user_id,
    );
  }

  // ==========================================
  // GET /borrows
  // ==========================================

  @Get()
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'List all borrowed books',
    description:
      'Returns the borrowing records of all users.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all borrows.',
    type: [BorrowResponseDto],
  })
  async findAll(): Promise<BorrowResponseDto[]> {
    return this.borrowsService.findAll();
  }

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
  // GET /borrows/:borrowId
  // ==========================================

  @Get(':borrowId')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L001',
  })
  @ApiOperation({
    summary: 'Get a borrowed book by borrow ID',
    description:
      'Returns a single borrowing record by its borrow ID.',
  })
  @ApiParam({
    name: 'borrowId',
    description: 'Borrow ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Borrow record found.',
    type: BorrowResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Borrow not found.',
  })
  async findOne(
    @Param(
      'borrowId',
      ParseIntPipe,
    )
    borrowId: number,
  ): Promise<BorrowResponseDto> {
    return this.borrowsService.findOne(borrowId);
  }
  // ==========================================
  // POST /borrows
  // ==========================================

  @Post()
  @UseGuards(UserIdGuard, RolesGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiConsumes('multipart/form-data')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Borrow a copy',
    description:
      'Borrows an available physical copy for a library user and changes the copy status to BORROWED. Each of the two fields is submitted as its own form field. copy_id is required and names the copy to borrow, while user_id is optional and defaults to the authenticated user, so an ADMIN or LIBRARIAN borrows for themselves by sending copy_id alone and borrows on another user\'s behalf by also sending user_id. A MEMBER may only ever borrow for themselves.',
  })
  @ApiBody({
    type: CreateBorrowDto,
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
      'Copy is not available, or the requesting MEMBER may only borrow books for themselves.',
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
@UseInterceptors(AnyFilesInterceptor())
@Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
@ApiConsumes('multipart/form-data')
@ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
@ApiOperation({
  summary: 'Return a copy',
  description:
    'Returns the active borrowing for a physical copy, records the return details, and changes the copy status to AVAILABLE. The copy is identified by the copyId path parameter, so the body carries only the return record itself. Each of the two fields is submitted as its own form field: condition is required and notes is optional, and either may be supplied independently of the other.',
})
@ApiBody({
  type: ReturnBorrowDto,
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
  status: 403,
  description:
    'Members can only return their own borrowed books.',
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
