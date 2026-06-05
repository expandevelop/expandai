import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { Roles } from '../auth/decorators/roles.decorator';
import { ProductCatalogsService } from './product-catalogs.service';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';

@ApiTags('Product Catalogs')
@Roles(UserRole.ADMIN, UserRole.OPERATOR, UserRole.PARTNER)
@Controller('product-catalogs')
export class ProductCatalogsController {
  constructor(
    private readonly productCatalogsService: ProductCatalogsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os produtos de catálogo do ecossistema.' })
  @ApiOkResponse({ description: 'Produtos de catálogo retornados com sucesso.' })
  findAll() {
    return this.productCatalogsService.findAll();
  }

  @Get('operator/:operatorId')
  @ApiOperation({ summary: 'Listar os produtos de catálogo de uma operadora.' })
  @ApiParam({ name: 'operatorId', description: 'Identificador da operadora.' })
  @ApiOkResponse({ description: 'Produtos da operadora retornados com sucesso.' })
  findByOperatorId(@Param('operatorId') operatorId: string) {
    return this.productCatalogsService.findByOperatorId(operatorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar um produto específico do catálogo.' })
  @ApiParam({ name: 'id', description: 'Identificador do produto de catálogo.' })
  @ApiOkResponse({ description: 'Produto de catálogo retornado com sucesso.' })
  findById(@Param('id') id: string) {
    return this.productCatalogsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar um novo produto de catálogo para uma operadora.' })
  @ApiCreatedResponse({ description: 'Produto de catálogo criado com sucesso.' })
  create(@Body() dto: CreateProductCatalogDto) {
    return this.productCatalogsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados comerciais do produto de catálogo.' })
  @ApiParam({ name: 'id', description: 'Identificador do produto de catálogo.' })
  @ApiOkResponse({ description: 'Produto de catálogo atualizado com sucesso.' })
  update(@Param('id') id: string, @Body() dto: UpdateProductCatalogDto) {
    return this.productCatalogsService.update(id, dto);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Ativar um produto de catálogo.' })
  @ApiParam({ name: 'id', description: 'Identificador do produto de catálogo.' })
  @ApiOkResponse({ description: 'Produto de catálogo ativado com sucesso.' })
  activate(@Param('id') id: string) {
    return this.productCatalogsService.activate(id);
  }

  @Patch(':id/deactivate')
  @ApiOperation({ summary: 'Inativar um produto de catálogo.' })
  @ApiParam({ name: 'id', description: 'Identificador do produto de catálogo.' })
  @ApiOkResponse({ description: 'Produto de catálogo inativado com sucesso.' })
  deactivate(@Param('id') id: string) {
    return this.productCatalogsService.deactivate(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover um produto de catálogo.' })
  @ApiParam({ name: 'id', description: 'Identificador do produto de catálogo.' })
  @ApiOkResponse({ description: 'Produto de catálogo removido com sucesso.' })
  remove(@Param('id') id: string) {
    return this.productCatalogsService.remove(id);
  }
}
