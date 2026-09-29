import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import { UsersService } from '../../../users/users.service';

@Injectable()
export class UserIdGuard implements CanActivate {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  async canActivate(
    context: ExecutionContext,
  ): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['user-id'];

    if (!userId || Array.isArray(userId)) {
      throw new UnauthorizedException(
        'User-Id header is required',
      );
    }

    const user =
      await this.usersService.findByIdForAuthorization(
        userId,
      );

    if (!user) {
      throw new UnauthorizedException(
        `User ${userId} not found`,
      );
    }

    request.user = user;

    return true;
  }
}
