import { ApiPropertyOptional } from '@nestjs/swagger';
import { SaleStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListSalesQueryDto {
  @ApiPropertyOptional({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Filtrar vendas por operadora.',
  })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({
    example: 'cmq17fehw0007qjpnsxoo3ua3',
    description: 'Filtrar vendas por partner responsável.',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    example: 'cmq1client0001qjpncliente001',
    description: 'Filtrar vendas por cliente relacionado.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'cmq18uxvv0001qjgvox7f6xdx',
    description: 'Filtrar vendas por produto de catálogo.',
  })
  @IsOptional()
  @IsString()
  productCatalogId?: string;

  @ApiPropertyOptional({
    enum: SaleStatus,
    example: SaleStatus.BILLED,
    description: 'Filtrar vendas por status operacional.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(SaleStatus)
  status?: SaleStatus;
}
