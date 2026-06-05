import { ConflictException, Injectable } from '@nestjs/common';
import {
  OnboardingActorType,
  OnboardingStatus,
  Prisma,
  RecordStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOperatorOnboardingDto } from './dto/create-operator-onboarding.dto';
import { CreatePartnerOnboardingDto } from './dto/create-partner-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async createOperator(payload: CreateOperatorOnboardingDto) {
    await this.ensureEmailAndDocumentAvailability(payload.email, payload.document);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: payload.companyName,
          email: payload.email,
          passwordHash,
          role: UserRole.OPERATOR,
          status: RecordStatus.PENDING,
          ecosystemProfile: 'operator',
          phone: payload.phone,
        },
      });

      const operator = await tx.operator.create({
        data: {
          userId: user.id,
          legalName: payload.companyName,
          tradeName: payload.companyName,
          document: payload.document,
          email: payload.email,
          phone: payload.phone,
          status: RecordStatus.PENDING,
        },
      });

      const onboarding = await tx.onboarding.create({
        data: {
          actorType: OnboardingActorType.OPERATOR,
          status: OnboardingStatus.PENDING_KYC,
          payload: payload as unknown as Prisma.InputJsonValue,
          operatorId: operator.id,
        },
      });

      return { user, operator, onboarding };
    });

    return {
      onboardingId: result.onboarding.id,
      actorType: 'operator',
      status: result.onboarding.status,
      userId: result.user.id,
      operatorId: result.operator.id,
      payload,
    };
  }

  async createPartner(payload: CreatePartnerOnboardingDto) {
    await this.ensureEmailAndDocumentAvailability(payload.email, payload.document);
    const passwordHash = await bcrypt.hash(payload.password, 10);

    const result = await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const user = await tx.user.create({
        data: {
          name: payload.contactName ?? payload.companyName,
          email: payload.email,
          passwordHash,
          role: UserRole.PARTNER,
          status: RecordStatus.PENDING,
          ecosystemProfile: 'partner',
        },
      });

      const partner = await tx.partner.create({
        data: {
          userId: user.id,
          document: payload.document,
          companyName: payload.companyName,
          partnerLevel: 'ENTRY',
          score: new Prisma.Decimal(0),
          status: RecordStatus.PENDING,
        },
      });

      const onboarding = await tx.onboarding.create({
        data: {
          actorType: OnboardingActorType.PARTNER,
          status: OnboardingStatus.PENDING_DOCUMENTS,
          payload: payload as unknown as Prisma.InputJsonValue,
          partnerId: partner.id,
        },
      });

      return { user, partner, onboarding };
    });

    return {
      onboardingId: result.onboarding.id,
      actorType: 'partner',
      status: result.onboarding.status,
      userId: result.user.id,
      partnerId: result.partner.id,
      payload,
    };
  }

  private async ensureEmailAndDocumentAvailability(email: string, document: string) {
    const [existingUser, existingOperator, existingPartner, existingClient] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.operator.findUnique({ where: { document } }),
      this.prisma.partner.findUnique({ where: { document } }),
      this.prisma.client.findUnique({ where: { document } }),
    ]);

    if (existingUser) {
      throw new ConflictException('Já existe um usuário cadastrado com este e-mail.');
    }

    if (existingOperator || existingPartner || existingClient) {
      throw new ConflictException('Já existe um cadastro associado a este documento.');
    }
  }
}
