import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateBillingRecordDto {
  @ApiProperty({
    example: 'cmq17d4qj0001qjpne2k7h1aa',
    description: 'Identificador da operadora dona do faturamento.',
  })
  @IsString()
  operatorId: string;

  @ApiPropertyOptional({
    example: 'cmq17g7lc0008qjpn7qj2azre',
    description: 'Identificador do partner relacionado à venda.',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    example: 'cmq17jn2f0009qjpnhl31e8to',
    description: 'Identificador do cliente final vinculado ao faturamento.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Identificador do produto do catálogo envolvido na venda.',
  })
  @IsOptional()
  @IsString()
  productCatalogId?: string;

  @ApiPropertyOptional({
    example: 'cmq17t0wb0010qjpn2jh7q8vf',
    description: 'Identificador da regra comercial aplicada à venda.',
  })
  @IsOptional()
  @IsString()
  commercialRuleId?: string;

  @ApiProperty({
    example: 'Faturamento mensal do produto Seguro PME Expand Protect',
    description: 'Descrição financeira da cobrança.',
  })
  @IsString()
  description: string;

  @ApiProperty({
    example: 15000,
    description: 'Valor bruto da cobrança.',
  })
  @Type(() => Number)
  @IsNumber()
  grossAmount: number;

  @ApiPropertyOptional({
    example: 13500,
    description: 'Valor líquido após ajustes ou retenções.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  netAmount?: number;

  @ApiPropertyOptional({
    example: 'VENDA-2026-0001',
    description: 'Referência externa da operação ou venda.',
  })
  @IsOptional()
  @IsString()
  externalReference?: string;

  @ApiPropertyOptional({
    example: '2026-06-30T00:00:00.000Z',
    description: 'Data de vencimento da cobrança.',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;
}
