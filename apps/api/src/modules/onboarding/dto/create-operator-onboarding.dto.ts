import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateOperatorOnboardingDto {
  @ApiProperty({ example: 'Operadora Exemplo S.A.' })
  @IsString()
  companyName!: string;

  @ApiProperty({ example: '00.000.000/0001-00' })
  @IsString()
  document!: string;

  @ApiProperty({ example: 'contato@operadora.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '+55 11 99999-9999', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    example: 'Expand@123',
    description: 'Senha inicial de acesso da operadora na plataforma',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
