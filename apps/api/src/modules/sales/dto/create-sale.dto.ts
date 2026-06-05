import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateSaleDto {
  @ApiPropertyOptional({
    example: 'cmq1abcde0001qjgvlead0001',
    description: 'Oportunidade que originou a venda.',
  })
  @IsOptional()
  @IsString()
  opportunityId?: string;

  @ApiProperty({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Operadora responsável pela venda.',
  })
  @IsString()
  operatorId: string;

  @ApiPropertyOptional({
    example: 'cmq17fd560005qjpnxp9k12ab',
    description: 'Partner responsável pela venda.',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    example: 'cmq17fd560007qjpnyy2j77cd',
    description: 'Cliente final relacionado à venda.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'cmq18uxvv0001qjgvox7f6xdx',
    description: 'Produto de catálogo comercializado.',
  })
  @IsOptional()
  @IsString()
  productCatalogId?: string;

  @ApiPropertyOptional({
    example: 'cmq18uyoo0003qjgv2nrdmana',
    description: 'Regra comercial que regerá o split da venda.',
  })
  @IsOptional()
  @IsString()
  commercialRuleId?: string;

  @ApiProperty({
    example: 'Venda confirmada - Seguro Empresarial Expand Protect',
    description: 'Título operacional da venda.',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Fechamento validado após aceite comercial e aprovação da proposta.',
    description: 'Descrição complementar da venda.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    example: 15000,
    description: 'Valor bruto da venda em reais.',
  })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  grossAmount: number;

  @ApiPropertyOptional({
    example: 12000,
    description: 'Valor líquido da venda, quando houver cálculo específico.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  netAmount?: number;

  @ApiPropertyOptional({
    example: 'VENDA-EXPAND-0001',
    description: 'Referência externa da venda para rastreabilidade.',
  })
  @IsOptional()
  @IsString()
  externalReference?: string;
}
