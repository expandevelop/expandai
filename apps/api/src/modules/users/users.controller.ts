import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from './users.service';

@Controller({
  path: 'users',
  version: '1',
})
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.PARTNER, UserRole.CLIENT)
  @Get('me')
  findMe(
    @CurrentUser()
    user: {
      id: string;
    },
  ) {
    return this.usersService.findMe(user.id);
  }

  @Roles(UserRole.ADMIN)
  @Get('roles')
  listRoles() {
    return this.usersService.listRoles();
  }
}
