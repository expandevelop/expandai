import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('deve retornar um access token no login', () => {
    const response = service.login('admin@expandai.com');

    expect(response).toHaveProperty('accessToken');
    expect(response.user.email).toBe('admin@expandai.com');
  });

  it('deve retornar sucesso no logout', () => {
    const response = service.logout();

    expect(response.success).toBe(true);
  });
});
