import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  login(email: string) {
    return {
      accessToken: 'mock-access-token',
      refreshToken: 'mock-refresh-token',
      user: {
        id: 'usr_mock_001',
        name: 'Usuário ExpandAI',
        email,
        role: 'admin',
      },
    };
  }

  refreshToken(refreshToken: string) {
    return {
      accessToken: 'mock-access-token-renewed',
      refreshToken,
    };
  }

  logout() {
    return {
      success: true,
      message: 'Sessão encerrada com sucesso.',
    };
  }
}
