import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { OpportunityStage } from '@prisma/client';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CreateOpportunityDto } from './create-opportunity.dto';

export class UpdateOpportunityDto extends PartialType(CreateOpportunityDto) {
  @ApiPropertyOptional({
    enum: OpportunityStage,
    example: OpportunityStage.PROPOSAL,
    description: 'Novo estágio operacional da oportunidade no pipeline comercial.',
  })
  @IsOptional()
  @IsEnum(OpportunityStage)
  stage?: OpportunityStage;

  @ApiPropertyOptional({
    example: 'Cliente interrompeu a negociação nesta etapa.',
    description: 'Motivo de perda quando a oportunidade for encerrada como LOST.',
  })
  @IsOptional()
  @IsString()
  lostReason?: string;
}
