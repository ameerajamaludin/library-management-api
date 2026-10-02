import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
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

import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserListItemResponseDto } from './dto/user-list-response.dto';
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
  @Roles('ADMIN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'List users',
    description:
      'Returns all library users with their roles, plus three status flags per user: has_active_borrow is true while the user holds any unreturned book, has_active_fine is true while any fine raised against the user is unsettled, and has_overdue_book is true while the user has a borrow more than one calendar day past its due date. The flags are a summary only and expose no borrow or fine detail for any individual user.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of users, each with borrowing and fine status flags',
    type: [UserListItemResponseDto],
  })
  async findAll(): Promise<UserListItemResponseDto[]> {
    return this.usersService.findAll();
  }


  // ==========================================
  // GET /users/overdue
  // ==========================================

  @Get('overdue')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'List users that have overdue books',
    description:
      'Returns every library user with at least one overdue borrowing, together with their overdue borrowing count.',
  })
  @ApiResponse({
    status: 200,
    description:
      'List of users that have overdue books.',
  })
  async findUsersWithOverdue() {
    return this.usersService.findUsersWithOverdue();
  }

  // ==========================================
  // GET /users/active-borrows
  // ==========================================

  // The status lists below are declared before GET /users/:id
  // because the router matches in declaration order, and ':id'
  // would otherwise capture these literal paths.
  @Get('active-borrows')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'List users that have active borrows',
    description:
      'Returns every library user holding at least one borrow that has not been returned, together with how many such borrows each of them has. A borrow counts as active while its return has not been recorded, which is the same condition the has_active_borrow flag on GET /users reports. The list is a summary and exposes no borrow detail for any individual user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users that have at least one active borrow.',
  })
  async findUsersWithActiveBorrows() {
    return this.usersService.findUsersWithActiveBorrows();
  }

  // ==========================================
  // GET /users/active-fines
  // ==========================================

  @Get('active-fines')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN', 'LIBRARIAN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'List users that have active fines',
    description:
      'Returns every library user with at least one outstanding fine, together with how many such fines each of them has. A fine stops being active once its status is PAID, which is the same condition the has_active_fine flag on GET /users reports. The list is a summary and exposes no fine detail or amount for any individual user.',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users that have at least one active fine.',
  })
  async findUsersWithActiveFines() {
    return this.usersService.findUsersWithActiveFines();
  }

  // ==========================================
  // GET /users/:id
  // ==========================================

  @Get(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L007' })
  @ApiOperation({
    summary: 'Get user by ID or name',
    description:
      'Returns a single library user by user_id, or by searching names. A name is matched case-insensitively as a substring, so a partial name returns every user whose name contains it. Each returned user includes their role and complete borrowing history, including copy and book details.',
  })
  @ApiParam({
    name: 'id',
    description:
      'User ID, or a name fragment to search (case-insensitive substring)',
    example: 'L002',
  })
  @ApiResponse({
    status: 200,
    description:
      'User details with borrowing history, copy information, and book information. A user_id match returns that single user; a name search returns an array of all users whose name contains the given text.',
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

  // ==========================================
  // POST /users
  // ==========================================

  @Post()
  @UseGuards(UserIdGuard, RolesGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: CreateUserDto,
  })
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'Add a new user',
    description:
      'Adds a new library user. userID, name, email and roleID are each separate, independently editable fields, and all four are required — the request is rejected unless every field is supplied.',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully.',
  })
  @ApiResponse({
    status: 409,
    description:
      'A user with this user ID or email already exists.',
  })
  async create(
    @Body()
    createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(
      createUserDto,
    );
  }


  // ==========================================
  // PATCH /users/:id
  // ==========================================

  @Patch(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @UseInterceptors(AnyFilesInterceptor())
  @Roles('ADMIN')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    type: UpdateUserDto,
  })
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'Update user metadata',
    description:
      'Updates the metadata fields of an existing user. name, email and role_id are each separate, independently editable fields and all three are required — the request is rejected unless every field is supplied. user_id is the path identifier and is not editable.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'L002',
  })
  @ApiResponse({
    status: 200,
    description: 'User updated successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  @ApiResponse({
    status: 400,
    description:
      'Request body is invalid. name, email and role_id are all required.',
  })
  @ApiResponse({
    status: 409,
    description:
      'The email is already in use by another user.',
  })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(
      id,
      updateUserDto,
    );
  }

  // ==========================================
  // DELETE /users/:id
  // ==========================================

  @Delete(':id')
  @UseGuards(UserIdGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiHeader({ name: 'User-Id', required: true, description: 'Library user ID used for authorization.', example: 'L001' })
  @ApiOperation({
    summary: 'Delete a user',
    description:
      'Deletes an existing library user.',
  })
  @ApiParam({
    name: 'id',
    description: 'User ID',
    example: 'L002',
  })
  @ApiResponse({
    status: 200,
    description: 'User deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found.',
  })
  async remove(
    @Param('id') id: string,
  ) {
    return this.usersService.deleteUser(id);
  }
}
