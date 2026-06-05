import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    const databaseUrl = process.env.DATABASE_URL ?? '';
    const hasPlaceholderCredentials =
      databaseUrl.includes('USER:PASSWORD') ||
      databaseUrl.includes('@HOST:') ||
      databaseUrl.includes('localhost:5432/expandai');

    if (!databaseUrl || hasPlaceholderCredentials) {
      this.logger.warn(
        'DATABASE_URL ainda não aponta para um PostgreSQL válido. A API seguirá operando em modo sem persistência.',
      );
      return;
    }

    await this.$connect();
  }
}
