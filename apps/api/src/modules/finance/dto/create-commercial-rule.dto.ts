import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateCommercialRuleDto {
  @ApiProperty({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Identificador do produto de catálogo ao qual a regra comercial pertence.',
  })
  @IsString()
  productCatalogId: string;

  @ApiProperty({
    example: 'cmq17d4qj0001qjpne2k7h1aa',
    description: 'Identificador da operadora dona da regra comercial.',
  })
  @IsString()
  operatorId: string;

  @ApiProperty({
    example: 40,
    description: 'Percentual do split destinado à operadora.',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  operatorPercentage: number;

  @ApiProperty({
    example: 40,
    description: 'Percentual do split destinado ao partner.',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  partnerPercentage: number;

  @ApiProperty({
    example: 20,
    description: 'Percentual do split destinado à plataforma.',
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  platformPercentage: number;

  @ApiPropertyOptional({
    example: 'Regra padrão para vendas originadas pela plataforma.',
    description: 'Observações complementares sobre a regra comercial.',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}
