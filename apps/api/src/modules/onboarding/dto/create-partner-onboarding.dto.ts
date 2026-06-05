import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CreatePartnerOnboardingDto {
  @ApiProperty({ example: 'Partner Exemplo Ltda.' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: '11.111.111/0001-11' })
  @IsString()
  document!: string;

  @ApiProperty({ example: 'parceiro@expandai.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'João Partner', required: false })
  @IsOptional()
  @IsString()
  contactName?: string;
}
