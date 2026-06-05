import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { SaleStatus, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ListSalesQueryDto } from './dto/list-sales-query.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@ApiTags('Sales')
@Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.PARTNER)
@Controller('sales')
export class SalesController {
  constructor(private readonly salesService: SalesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar vendas com filtros operacionais do ecossistema.' })
  @ApiOkResponse({ description: 'Vendas retornadas com sucesso.' })
  findAll(@Query() query: ListSalesQueryDto) {
    return this.salesService.findAll(query);
  }

  @Get('operator/:operatorId')
  @ApiOperation({ summary: 'Listar vendas vinculadas a uma operadora.' })
  @ApiParam({ name: 'operatorId', description: 'Identificador da operadora.' })
  @ApiOkResponse({ description: 'Vendas da operadora retornadas com sucesso.' })
  findByOperatorId(@Param('operatorId') operatorId: string) {
    return this.salesService.findByOperatorId(operatorId);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Listar vendas atribuídas a um partner.' })
  @ApiParam({ name: 'partnerId', description: 'Identificador do partner.' })
  @ApiOkResponse({ description: 'Vendas do partner retornadas com sucesso.' })
  findByPartnerId(@Param('partnerId') partnerId: string) {
    return this.salesService.findByPartnerId(partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma venda específica.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiOkResponse({ description: 'Venda retornada com sucesso.' })
  findById(@Param('id') id: string) {
    return this.salesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Registrar uma nova venda no ecossistema.' })
  @ApiCreatedResponse({ description: 'Venda criada com sucesso.' })
  create(@Body() dto: CreateSaleDto) {
    return this.salesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados operacionais de uma venda.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiOkResponse({ description: 'Venda atualizada com sucesso.' })
  update(@Param('id') id: string, @Body() dto: UpdateSaleDto) {
    return this.salesService.update(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Atualizar o status operacional de uma venda.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['status'],
      properties: {
        status: {
          type: 'string',
          enum: Object.values(SaleStatus),
          example: SaleStatus.PAYMENT_CONFIRMED,
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Status da venda atualizado com sucesso.' })
  updateStatus(@Param('id') id: string, @Body() body: { status: SaleStatus }) {
    return this.salesService.updateStatus(id, body.status);
  }

  @Patch(':id/mark-billed')
  @ApiOperation({ summary: 'Vincular uma venda a um registro de faturamento.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['billingRecordId'],
      properties: {
        billingRecordId: {
          type: 'string',
          example: 'cmq1fin00001qjgv9cd8billing',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Venda vinculada ao faturamento com sucesso.' })
  markAsBilled(
    @Param('id') id: string,
    @Body() body: { billingRecordId: string },
  ) {
    return this.salesService.markAsBilled(id, body.billingRecordId);
  }

  @Patch(':id/sync-billing-status')
  @ApiOperation({ summary: 'Sincronizar o status da venda com o faturamento vinculado.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiOkResponse({ description: 'Status da venda sincronizado com sucesso.' })
  syncBillingStatus(@Param('id') id: string) {
    return this.salesService.syncStatusFromBilling(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma venda sem vínculo de faturamento.' })
  @ApiParam({ name: 'id', description: 'Identificador da venda.' })
  @ApiOkResponse({ description: 'Venda removida com sucesso.' })
  remove(@Param('id') id: string) {
    return this.salesService.remove(id);
  }
}
