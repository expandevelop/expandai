import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@expandai.com',
    description: 'E-mail do usuário que deseja autenticar-se na plataforma',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    example: 'Expand@123',
    description: 'Senha do usuário para autenticação na plataforma',
    minLength: 8,
  })
  @IsString()
  @MinLength(8)
  password!: string;
}
