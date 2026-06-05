import { Controller, Get, Param } from '@nestjs/common';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { PartnersService } from './partners.service';

@Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.PARTNER)
@Controller({
  path: 'partners',
  version: '1',
})
export class PartnersController {
  constructor(private readonly partnersService: PartnersService) {}

  @Get()
  findAll() {
    return this.partnersService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.partnersService.findById(id);
  }
}
