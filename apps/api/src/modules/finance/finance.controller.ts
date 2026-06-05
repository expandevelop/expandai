import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { FinanceService } from './finance.service';
import { CreateBillingRecordDto } from './dto/create-billing-record.dto';
import { CreateCommercialRuleDto } from './dto/create-commercial-rule.dto';

@ApiTags('Finance')
@Roles(UserRole.ADMIN, UserRole.OPERATOR)
@Controller('finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('commercial-rules')
  @ApiOperation({ summary: 'Listar as regras comerciais de split cadastradas.' })
  @ApiOkResponse({ description: 'Regras comerciais retornadas com sucesso.' })
  listCommercialRules() {
    return this.financeService.listCommercialRules();
  }

  @Post('commercial-rules')
  @ApiOperation({ summary: 'Criar ou atualizar a regra comercial de um produto.' })
  @ApiCreatedResponse({ description: 'Regra comercial registrada com sucesso.' })
  createCommercialRule(@Body() dto: CreateCommercialRuleDto) {
    return this.financeService.createCommercialRule(dto);
  }

  @Get('billing-records')
  @ApiOperation({ summary: 'Listar os registros de faturamento e seus splits.' })
  @ApiOkResponse({ description: 'Registros de faturamento retornados com sucesso.' })
  listBillingRecords() {
    return this.financeService.listBillingRecords();
  }

  @Post('billing-records')
  @ApiOperation({ summary: 'Criar um registro de faturamento com cálculo inicial de split.' })
  @ApiCreatedResponse({ description: 'Registro de faturamento criado com sucesso.' })
  createBillingRecord(@Body() dto: CreateBillingRecordDto) {
    return this.financeService.createBillingRecord(dto);
  }

  @Patch('billing-records/:id/pay')
  @ApiOperation({ summary: 'Marcar um registro de faturamento como pago e liberar o split.' })
  @ApiParam({ name: 'id', description: 'Identificador do registro de faturamento.' })
  @ApiOkResponse({ description: 'Registro de faturamento liquidado com sucesso.' })
  markAsPaid(@Param('id') id: string) {
    return this.financeService.markAsPaid(id);
  }
}
