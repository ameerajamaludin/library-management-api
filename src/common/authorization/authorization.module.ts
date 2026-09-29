import { Global, Module } from '@nestjs/common';

import { UsersModule } from '../../users/users.module';
import { UserIdGuard } from './guards/user-id.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [UsersModule],
  providers: [
    UserIdGuard,
    RolesGuard,
  ],
  exports: [
    UserIdGuard,
    RolesGuard,
  ],
})
export class AuthorizationModule {}
