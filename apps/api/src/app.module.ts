import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { UsersModule } from './modules/users/users.module';
import { OnboardingModule } from './modules/onboarding/onboarding.module';
import { PrismaModule } from './prisma/prisma.module';
import { OperatorsModule } from './modules/operators/operators.module';
import { PartnersModule } from './modules/partners/partners.module';
import { ClientsModule } from './modules/clients/clients.module';
import { ProductCatalogsModule } from './modules/product-catalogs/product-catalogs.module';
import { FinanceModule } from './modules/finance/finance.module';
import { OpportunitiesModule } from './modules/opportunities/opportunities.module';
import { SalesModule } from './modules/sales/sales.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    OnboardingModule,
    OperatorsModule,
    PartnersModule,
    ClientsModule,
    ProductCatalogsModule,
    FinanceModule,
    OpportunitiesModule,
    SalesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
