import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class CreateOpportunityDto {
  @ApiProperty({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Identificador da operadora responsável pela oportunidade.',
  })
  @IsString()
  operatorId: string;

  @ApiPropertyOptional({
    example: 'cmq17fd560005qjpnxp9k12ab',
    description: 'Identificador do partner responsável pela condução comercial.',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    example: 'cmq17fd560007qjpnyy2j77cd',
    description: 'Identificador do cliente final associado à oportunidade.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'cmq18uxvv0001qjgvox7f6xdx',
    description: 'Produto de catálogo relacionado à oportunidade.',
  })
  @IsOptional()
  @IsString()
  productCatalogId?: string;

  @ApiProperty({
    example: 'Expansão de seguro empresarial para rede varejista',
    description: 'Título resumido da oportunidade comercial.',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    example: 'Lead qualificado oriundo de prospecção outbound com interesse em proposta até o fim do mês.',
    description: 'Descrição detalhada do contexto comercial da oportunidade.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'OUTBOUND_AI',
    description: 'Origem da oportunidade dentro do ecossistema comercial.',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    example: 25000,
    description: 'Valor estimado potencial da oportunidade em reais.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  estimatedValue?: number;

  @ApiPropertyOptional({
    example: '2026-06-30T23:59:59.000Z',
    description: 'Data esperada de fechamento da oportunidade.',
  })
  @IsOptional()
  @IsDateString()
  closeExpectedAt?: string;
}
