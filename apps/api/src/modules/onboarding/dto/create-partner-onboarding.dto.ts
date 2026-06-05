import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

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

  @ApiProperty({
    example: 'Expand@123',
    description: 'Senha inicial de acesso do partner na plataforma',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
