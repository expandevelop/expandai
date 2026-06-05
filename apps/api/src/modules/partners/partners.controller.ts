import { Controller, Get, Param } from '@nestjs/common';
import { PartnersService } from './partners.service';

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
