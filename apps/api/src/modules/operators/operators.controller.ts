import { Controller, Get, Param } from '@nestjs/common';
import { OperatorsService } from './operators.service';

@Controller({
  path: 'operators',
  version: '1',
})
export class OperatorsController {
  constructor(private readonly operatorsService: OperatorsService) {}

  @Get()
  findAll() {
    return this.operatorsService.findAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.operatorsService.findById(id);
  }
}
