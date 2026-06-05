import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RecordStatus, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.validateCredentials(email, password);

    return this.buildAuthResponse(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        type?: string;
      }>(refreshToken, {
        secret: this.getRefreshTokenSecret(),
      });

      if (payload.type !== 'refresh') {
        throw new UnauthorizedException('Refresh token inválido.');
      }

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('Usuário do refresh token não foi encontrado.');
      }

      this.ensureUserCanAuthenticate(user);

      return this.buildAuthResponse(user);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Refresh token inválido ou expirado.');
    }
  }

  logout() {
    return {
      success: true,
      message: 'Sessão encerrada com sucesso.',
    };
  }

  private async validateCredentials(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    this.ensureUserCanAuthenticate(user);

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas.');
    }

    return user;
  }

  private ensureUserCanAuthenticate(user: User) {
    if (
      user.status === RecordStatus.INACTIVE ||
      user.status === RecordStatus.SUSPENDED
    ) {
      throw new UnauthorizedException(
        'Este usuário não está apto a autenticar-se na plataforma.',
      );
    }
  }

  private async buildAuthResponse(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ecosystemProfile: user.ecosystemProfile,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.getAccessTokenSecret(),
        expiresIn: this.getAccessTokenExpiresIn(),
      }),
      this.jwtService.signAsync(
        {
          sub: user.id,
          type: 'refresh',
        },
        {
          secret: this.getRefreshTokenSecret(),
          expiresIn: this.getRefreshTokenExpiresIn(),
        },
      ),
    ]);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        ecosystemProfile: user.ecosystemProfile,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }

  private getAccessTokenSecret() {
    return (
      this.configService.get<string>('JWT_ACCESS_TOKEN_SECRET') ??
      this.configService.get<string>('JWT_SECRET') ??
      'expandai-access-token-secret'
    );
  }

  private getRefreshTokenSecret() {
    return (
      this.configService.get<string>('JWT_REFRESH_TOKEN_SECRET') ??
      this.configService.get<string>('JWT_REFRESH_SECRET') ??
      'expandai-refresh-token-secret'
    );
  }

  private getAccessTokenExpiresIn(): never {
    return ((this.configService.get<string>('JWT_ACCESS_TOKEN_EXPIRES_IN') ??
      '15m') as never);
  }

  private getRefreshTokenExpiresIn(): never {
    return ((this.configService.get<string>('JWT_REFRESH_TOKEN_EXPIRES_IN') ??
      '7d') as never);
  }
}
