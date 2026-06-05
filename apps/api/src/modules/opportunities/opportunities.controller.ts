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
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { OpportunityStage, UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { OpportunitiesService } from './opportunities.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@ApiTags('Opportunities')
@Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.PARTNER)
@Controller('opportunities')
export class OpportunitiesController {
  constructor(private readonly opportunitiesService: OpportunitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar oportunidades com filtros operacionais do pipeline.' })
  @ApiOkResponse({ description: 'Oportunidades retornadas com sucesso.' })
  findAll(@Query() query: ListOpportunitiesQueryDto) {
    return this.opportunitiesService.findAll(query);
  }

  @Get('operator/:operatorId')
  @ApiOperation({ summary: 'Listar oportunidades vinculadas a uma operadora.' })
  @ApiParam({ name: 'operatorId', description: 'Identificador da operadora.' })
  @ApiOkResponse({ description: 'Oportunidades da operadora retornadas com sucesso.' })
  findByOperatorId(@Param('operatorId') operatorId: string) {
    return this.opportunitiesService.findByOperatorId(operatorId);
  }

  @Get('partner/:partnerId')
  @ApiOperation({ summary: 'Listar oportunidades atribuídas a um partner.' })
  @ApiParam({ name: 'partnerId', description: 'Identificador do partner.' })
  @ApiOkResponse({ description: 'Oportunidades do partner retornadas com sucesso.' })
  findByPartnerId(@Param('partnerId') partnerId: string) {
    return this.opportunitiesService.findByPartnerId(partnerId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar uma oportunidade específica.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiOkResponse({ description: 'Oportunidade retornada com sucesso.' })
  findById(@Param('id') id: string) {
    return this.opportunitiesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar uma nova oportunidade comercial.' })
  @ApiCreatedResponse({ description: 'Oportunidade criada com sucesso.' })
  create(@Body() dto: CreateOpportunityDto) {
    return this.opportunitiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados operacionais de uma oportunidade.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiOkResponse({ description: 'Oportunidade atualizada com sucesso.' })
  update(@Param('id') id: string, @Body() dto: UpdateOpportunityDto) {
    return this.opportunitiesService.update(id, dto);
  }

  @Patch(':id/stage')
  @ApiOperation({ summary: 'Atualizar diretamente o estágio operacional da oportunidade.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['stage'],
      properties: {
        stage: {
          type: 'string',
          enum: Object.values(OpportunityStage),
          example: OpportunityStage.PROPOSAL,
        },
        reason: {
          type: 'string',
          example: 'Cliente optou por postergar a contratação.',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Estágio da oportunidade atualizado com sucesso.' })
  updateStage(
    @Param('id') id: string,
    @Body() body: { stage: OpportunityStage; reason?: string },
  ) {
    return this.opportunitiesService.updateStage(id, body.stage, body.reason);
  }

  @Patch(':id/won')
  @ApiOperation({ summary: 'Marcar uma oportunidade como ganha.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiOkResponse({ description: 'Oportunidade marcada como ganha com sucesso.' })
  markAsWon(@Param('id') id: string) {
    return this.opportunitiesService.markAsWon(id);
  }

  @Patch(':id/lost')
  @ApiOperation({ summary: 'Marcar uma oportunidade como perdida.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          example: 'Cliente optou por adiar a contratação.',
        },
      },
    },
    required: false,
  })
  @ApiOkResponse({ description: 'Oportunidade marcada como perdida com sucesso.' })
  markAsLost(
    @Param('id') id: string,
    @Body() body?: { reason?: string },
  ) {
    return this.opportunitiesService.markAsLost(id, body?.reason);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover uma oportunidade sem venda vinculada.' })
  @ApiParam({ name: 'id', description: 'Identificador da oportunidade.' })
  @ApiOkResponse({ description: 'Oportunidade removida com sucesso.' })
  remove(@Param('id') id: string) {
    return this.opportunitiesService.remove(id);
  }
}
