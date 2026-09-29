import {
  Controller,
  Get,
  Param,
} from '@nestjs/common';

import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UseGuards, Req } from '@nestjs/common';
import { ApiHeader } from '@nestjs/swagger';
import { Roles } from '../common/authorization/decorators/roles.decorator';
import { UserIdGuard } from '../common/authorization/guards/user-id.guard';
import { RolesGuard } from '../common/authorization/guards/roles.guard';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // GET /users
  // ==========================================

  @Get()
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns all library users with their roles.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  async findAll(): Promise<User[]> {
    return this.usersService.findAll();
  }


  // ==========================================
  // GET /users/:id/overdue
  // ==========================================

  @Get(':id/overdue')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({
    name: 'User-Id',
    required: true,
    description: 'Library user ID used for authorization.',
    example: 'L007',
  })
  @ApiOperation({
    summary: 'Get user overdue borrows',
    description:
      'Returns active borrows for the specified user whose due date has passed.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'L007',
  })
  @ApiResponse({
    status: 200,
    description: 'Overdue borrows for the user.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async findOverdue(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.usersService.findOverdue(
      id,
      request.user.user_id,
      request.user.role.role_name,
    );
  }

  // ==========================================
  // GET /users/:id
  // ==========================================

  @Get(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN', 'MEMBER')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Get user by ID',
    description:
      'Returns a single library user with their role and complete borrowing history, including copy and book details.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'L002',
  })
  @ApiResponse({
    status: 200,
    description:
      'User details with borrowing history, copy information, and book information.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async findOne(
    @Param('id') id: string,
    @Req() request: any,
  ) {
    return this.usersService.findOne(
      id,
      request.user.user_id,
      request.user.role.role_name,
    );
  }
}