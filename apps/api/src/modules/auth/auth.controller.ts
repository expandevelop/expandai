import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { AuthService } from './auth.service';

@ApiTags('Auth')
@Controller({
  path: 'auth',
  version: '1',
})
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @ApiOperation({ summary: 'Realizar login inicial na plataforma' })
  @Post('login')
  login(@Body() payload: LoginDto) {
    return this.authService.login(payload.email, payload.password);
  }

  @Public()
  @ApiOperation({ summary: 'Renovar o token de sessão do usuário' })
  @Post('refresh')
  refresh(@Body() payload: RefreshTokenDto) {
    return this.authService.refreshToken(payload.refreshToken);
  }

  @ApiOperation({ summary: 'Encerrar a sessão ativa do usuário' })
  @Post('logout')
  logout() {
    return this.authService.logout();
  }
}
