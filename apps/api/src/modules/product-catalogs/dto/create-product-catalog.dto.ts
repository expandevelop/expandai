import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateProductCatalogDto {
  @ApiProperty({
    example: 'cmq17fd560002qjpnhe4qj2mr',
    description: 'Identificador da operadora proprietária do catálogo.',
  })
  @IsString()
  operatorId: string;

  @ApiProperty({
    example: 'Seguro PME Expand Protect',
    description: 'Nome comercial do produto disponível para os partners.',
  })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    example: 'Produto voltado a pequenas e médias empresas com cobertura ampliada.',
    description: 'Descrição comercial e operacional do produto.',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: 'Seguros Empresariais',
    description: 'Categoria usada para organização do catálogo da operadora.',
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({
    example: '40% operador / 40% partner / 20% plataforma',
    description: 'Regra comercial resumida do produto para cálculo futuro de split.',
  })
  @IsOptional()
  @IsString()
  commissionRule?: string;
}
