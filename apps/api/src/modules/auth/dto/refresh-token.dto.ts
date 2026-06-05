import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RefreshTokenDto {
  @ApiProperty({
    example: 'mock-refresh-token',
    description: 'Token de renovação de sessão do usuário autenticado',
  })
  @IsString()
  refreshToken!: string;
}
