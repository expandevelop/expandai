import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    example: 'admin@expandai.com',
    description: 'E-mail do usuário que deseja autenticar-se na plataforma',
  })
  @IsEmail()
  email!: string;
}
