import { ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStage } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString } from 'class-validator';

export class ListOpportunitiesQueryDto {
  @ApiPropertyOptional({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Filtrar oportunidades por operadora.',
  })
  @IsOptional()
  @IsString()
  operatorId?: string;

  @ApiPropertyOptional({
    example: 'cmq17fehw0007qjpnsxoo3ua3',
    description: 'Filtrar oportunidades por partner responsável.',
  })
  @IsOptional()
  @IsString()
  partnerId?: string;

  @ApiPropertyOptional({
    example: 'cmq1client0001qjpncliente001',
    description: 'Filtrar oportunidades por cliente relacionado.',
  })
  @IsOptional()
  @IsString()
  clientId?: string;

  @ApiPropertyOptional({
    example: 'cmq18uxvv0001qjgvox7f6xdx',
    description: 'Filtrar oportunidades por produto de catálogo.',
  })
  @IsOptional()
  @IsString()
  productCatalogId?: string;

  @ApiPropertyOptional({
    enum: OpportunityStage,
    example: OpportunityStage.QUALIFIED,
    description: 'Filtrar oportunidades por estágio do pipeline comercial.',
  })
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;
}
