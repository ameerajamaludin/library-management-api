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
  // GET /users/:id
  // ==========================================

  @Get(':id')
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
  ) {
    return this.usersService.findOne(id);
  }
}