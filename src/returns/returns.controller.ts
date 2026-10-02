import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';

import {
  ApiHeader,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ReturnsService } from './returns.service';

import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Returns')
@Controller('returns')
export class ReturnsController {
  constructor(
    private readonly returnsService: ReturnsService,
  ) {}

  // ==========================================
  // GET /returns
  // ==========================================

  @Get()
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
    summary: 'List return records',
    description:
      'Returns all return records with the related borrow, user, copy, and book information.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of return records.',
  })
  async findAll() {
    return this.returnsService.findAll();
  }

  // ==========================================
  // GET /returns/history
  // ==========================================

  @Get('history')
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
    summary: 'List returned borrow history',
    description:
      'Returns every borrow that has been returned, including its return record.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of returned borrows.',
  })
  async findReturnedBorrows() {
    return this.returnsService.findReturnedBorrows();
  }

  // ==========================================
  // GET /returns/:returnId
  // ==========================================

  @Get(':returnId')
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
    summary: 'Get a returned book by return ID',
    description:
      'Returns a single return record with the related borrow, user, copy, and book information.',
  })
  @ApiParam({
    name: 'returnId',
    description: 'Return ID',
    example: 1,
  })
  @ApiResponse({
    status: 200,
    description: 'Return record found.',
  })
  @ApiResponse({
    status: 404,
    description: 'Return not found.',
  })
  async findOne(
    @Param(
      'returnId',
      ParseIntPipe,
    )
    returnId: number,
  ) {
    return this.returnsService.findOne(returnId);
  }
}
