import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BillingStatus, Prisma, SplitStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBillingRecordDto } from './dto/create-billing-record.dto';
import { CreateCommercialRuleDto } from './dto/create-commercial-rule.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly prisma: PrismaService) {}

  listCommercialRules() {
    return this.prisma.commercialRule.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
          },
        },
      },
    });
  }

  async createCommercialRule(dto: CreateCommercialRuleDto) {
    const totalPercentage =
      dto.operatorPercentage + dto.partnerPercentage + dto.platformPercentage;

    if (totalPercentage !== 100) {
      throw new BadRequestException(
        'A soma dos percentuais da regra comercial deve ser exatamente 100%.',
      );
    }

    const productCatalog = await this.prisma.productCatalog.findUnique({
      where: { id: dto.productCatalogId },
      select: { id: true, operatorId: true, name: true },
    });

    if (!productCatalog) {
      throw new NotFoundException('Produto de catálogo não encontrado.');
    }

    if (productCatalog.operatorId !== dto.operatorId) {
      throw new BadRequestException(
        'A regra comercial deve pertencer à mesma operadora do produto informado.',
      );
    }

    return this.prisma.commercialRule.upsert({
      where: { productCatalogId: dto.productCatalogId },
      update: {
        operatorId: dto.operatorId,
        operatorPercentage: dto.operatorPercentage,
        partnerPercentage: dto.partnerPercentage,
        platformPercentage: dto.platformPercentage,
        notes: dto.notes,
      },
      create: {
        operatorId: dto.operatorId,
        productCatalogId: dto.productCatalogId,
        operatorPercentage: dto.operatorPercentage,
        partnerPercentage: dto.partnerPercentage,
        platformPercentage: dto.platformPercentage,
        notes: dto.notes,
      },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
      },
    });
  }

  listBillingRecords() {
    return this.prisma.billingRecord.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerLevel: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
            document: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        splitAllocations: true,
      },
    });
  }

  async getBillingRecordById(id: string) {
    const billingRecord = await this.prisma.billingRecord.findUnique({
      where: { id },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerLevel: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
            document: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        commercialRule: {
          select: {
            id: true,
            operatorPercentage: true,
            partnerPercentage: true,
            platformPercentage: true,
            notes: true,
          },
        },
        splitAllocations: true,
      },
    });

    if (!billingRecord) {
      throw new NotFoundException('Registro de faturamento não encontrado.');
    }

    return billingRecord;
  }

  async createBillingRecord(dto: CreateBillingRecordDto) {
    const operator = await this.prisma.operator.findUnique({
      where: { id: dto.operatorId },
      select: { id: true },
    });

    if (!operator) {
      throw new NotFoundException('Operadora não encontrada para o faturamento.');
    }

    if (dto.partnerId) {
      const partner = await this.prisma.partner.findUnique({
        where: { id: dto.partnerId },
        select: { id: true },
      });

      if (!partner) {
        throw new NotFoundException('Partner não encontrado para o faturamento.');
      }
    }

    if (dto.clientId) {
      const client = await this.prisma.client.findUnique({
        where: { id: dto.clientId },
        select: { id: true },
      });

      if (!client) {
        throw new NotFoundException('Cliente não encontrado para o faturamento.');
      }
    }

    const commercialRule = dto.commercialRuleId
      ? await this.prisma.commercialRule.findUnique({
          where: { id: dto.commercialRuleId },
          select: {
            id: true,
            operatorPercentage: true,
            partnerPercentage: true,
            platformPercentage: true,
          },
        })
      : null;

    if (dto.commercialRuleId && !commercialRule) {
      throw new NotFoundException('Regra comercial não encontrada.');
    }

    const createdRecord = await this.prisma.billingRecord.create({
      data: {
        operatorId: dto.operatorId,
        partnerId: dto.partnerId,
        clientId: dto.clientId,
        productCatalogId: dto.productCatalogId,
        commercialRuleId: dto.commercialRuleId,
        description: dto.description,
        grossAmount: this.toDecimal(dto.grossAmount),
        netAmount: dto.netAmount ? this.toDecimal(dto.netAmount) : null,
        externalReference: dto.externalReference,
        dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
        status: BillingStatus.PENDING,
        splitStatus: commercialRule ? SplitStatus.CALCULATED : SplitStatus.PENDING,
      },
    });

    if (commercialRule) {
      await this.createSplitAllocations(
        createdRecord.id,
        dto.grossAmount,
        dto.operatorId,
        dto.partnerId,
        commercialRule,
      );
    }

    return this.prisma.billingRecord.findUnique({
      where: { id: createdRecord.id },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerLevel: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
          },
        },
        commercialRule: {
          select: {
            id: true,
            operatorPercentage: true,
            partnerPercentage: true,
            platformPercentage: true,
            notes: true,
          },
        },
        splitAllocations: true,
      },
    });
  }

  async markAsPaid(id: string) {
    const existing = await this.prisma.billingRecord.findUnique({
      where: { id },
      include: { splitAllocations: true },
    });

    if (!existing) {
      throw new NotFoundException('Registro de faturamento não encontrado.');
    }

    await this.prisma.billingRecord.update({
      where: { id },
      data: {
        status: BillingStatus.PAYMENT_CONFIRMED,
        splitStatus: existing.splitAllocations.length
          ? SplitStatus.RELEASED
          : existing.splitStatus,
        paidAt: new Date(),
      },
    });

    if (existing.splitAllocations.length) {
      await this.prisma.splitAllocation.updateMany({
        where: { billingRecordId: id },
        data: { status: SplitStatus.RELEASED },
      });
    }

    return this.prisma.billingRecord.findUnique({
      where: { id },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
        partner: {
          select: {
            id: true,
            companyName: true,
            partnerLevel: true,
          },
        },
        client: {
          select: {
            id: true,
            companyName: true,
            document: true,
          },
        },
        productCatalog: {
          select: {
            id: true,
            name: true,
            category: true,
          },
        },
        commercialRule: {
          select: {
            id: true,
            operatorPercentage: true,
            partnerPercentage: true,
            platformPercentage: true,
            notes: true,
          },
        },
        splitAllocations: true,
      },
    });
  }

  private async createSplitAllocations(
    billingRecordId: string,
    grossAmount: number,
    operatorId: string,
    partnerId: string | undefined,
    rule: {
      id: string;
      operatorPercentage: Prisma.Decimal;
      partnerPercentage: Prisma.Decimal;
      platformPercentage: Prisma.Decimal;
    },
  ) {
    const allocations = [
      {
        billingRecordId,
        recipientType: 'OPERATOR',
        recipientId: operatorId,
        percentage: rule.operatorPercentage,
        amount: this.calculateAmount(grossAmount, Number(rule.operatorPercentage)),
        status: SplitStatus.CALCULATED,
      },
      {
        billingRecordId,
        recipientType: 'PLATFORM',
        recipientId: null,
        percentage: rule.platformPercentage,
        amount: this.calculateAmount(grossAmount, Number(rule.platformPercentage)),
        status: SplitStatus.CALCULATED,
      },
    ];

    if (partnerId) {
      allocations.push({
        billingRecordId,
        recipientType: 'PARTNER',
        recipientId: partnerId,
        percentage: rule.partnerPercentage,
        amount: this.calculateAmount(grossAmount, Number(rule.partnerPercentage)),
        status: SplitStatus.CALCULATED,
      });
    }

    await this.prisma.splitAllocation.createMany({
      data: allocations,
    });
  }

  private calculateAmount(amount: number, percentage: number) {
    return this.toDecimal((amount * percentage) / 100);
  }

  private toDecimal(value: number) {
    return new Prisma.Decimal(value.toFixed(2));
  }
}
