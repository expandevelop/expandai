import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BillingStatus,
  OpportunityStage,
  Prisma,
  SaleStatus,
  SplitStatus,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { ListSalesQueryDto } from './dto/list-sales-query.dto';
import { UpdateSaleDto } from './dto/update-sale.dto';

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: ListSalesQueryDto = {}) {
    return this.prisma.sale.findMany({
      where: this.buildWhere(filters),
      orderBy: { createdAt: 'desc' },
      include: this.defaultInclude(),
    });
  }

  findByOperatorId(operatorId: string) {
    return this.findAll({ operatorId });
  }

  findByPartnerId(partnerId: string) {
    return this.findAll({ partnerId });
  }

  async findById(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada.');
    }

    return sale;
  }

  async create(dto: CreateSaleDto) {
    const rule = await this.validateReferences(dto);

    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.create({
        data: {
          opportunityId: dto.opportunityId,
          operatorId: dto.operatorId,
          partnerId: dto.partnerId,
          clientId: dto.clientId,
          productCatalogId: dto.productCatalogId,
          commercialRuleId: rule?.id,
          externalReference: dto.externalReference,
          title: dto.title,
          description: dto.description,
          grossAmount: this.toDecimal(dto.grossAmount),
          netAmount:
            dto.netAmount !== undefined ? this.toDecimal(dto.netAmount) : null,
          status: SaleStatus.PENDING_BILLING,
          closedAt: new Date(),
        },
      });

      const billingRecord = await tx.billingRecord.create({
        data: {
          commercialRuleId: rule?.id,
          operatorId: dto.operatorId,
          partnerId: dto.partnerId,
          clientId: dto.clientId,
          productCatalogId: dto.productCatalogId,
          externalReference: dto.externalReference,
          description: dto.title,
          grossAmount: this.toDecimal(dto.grossAmount),
          netAmount:
            dto.netAmount !== undefined ? this.toDecimal(dto.netAmount) : null,
          status: BillingStatus.PENDING,
          splitStatus: rule ? SplitStatus.CALCULATED : SplitStatus.PENDING,
        },
      });

      if (rule) {
        await this.createSplitAllocations(
          tx,
          billingRecord.id,
          dto.grossAmount,
          dto.operatorId,
          dto.partnerId,
          rule,
        );
      }

      if (dto.opportunityId) {
        await tx.opportunity.update({
          where: { id: dto.opportunityId },
          data: {
            stage: OpportunityStage.WON,
            wonAt: new Date(),
            lostReason: null,
          },
        });
      }

      return tx.sale.update({
        where: { id: sale.id },
        data: {
          billingRecordId: billingRecord.id,
          status: SaleStatus.BILLED,
        },
        include: this.defaultInclude(),
      });
    });
  }

  async update(id: string, dto: UpdateSaleDto) {
    const current = await this.ensureExists(id);
    const basePayload: CreateSaleDto = {
      opportunityId: dto.opportunityId ?? current.opportunityId ?? undefined,
      operatorId: dto.operatorId ?? current.operatorId,
      partnerId: dto.partnerId ?? current.partnerId ?? undefined,
      clientId: dto.clientId ?? current.clientId ?? undefined,
      productCatalogId: dto.productCatalogId ?? current.productCatalogId ?? undefined,
      commercialRuleId:
        dto.commercialRuleId ?? current.commercialRuleId ?? undefined,
      title: dto.title ?? current.title,
      description: dto.description ?? current.description ?? undefined,
      grossAmount:
        dto.grossAmount !== undefined
          ? dto.grossAmount
          : Number(current.grossAmount),
      netAmount:
        dto.netAmount !== undefined
          ? dto.netAmount
          : current.netAmount
            ? Number(current.netAmount)
            : undefined,
      externalReference:
        dto.externalReference ?? current.externalReference ?? undefined,
    };

    const rule = await this.validateReferences(basePayload, id);

    return this.prisma.sale.update({
      where: { id },
      data: {
        opportunityId: dto.opportunityId,
        operatorId: dto.operatorId,
        partnerId: dto.partnerId,
        clientId: dto.clientId,
        productCatalogId: dto.productCatalogId,
        commercialRuleId:
          dto.commercialRuleId !== undefined ? rule?.id ?? null : undefined,
        externalReference: dto.externalReference,
        title: dto.title,
        description: dto.description,
        grossAmount:
          dto.grossAmount !== undefined ? this.toDecimal(dto.grossAmount) : undefined,
        netAmount:
          dto.netAmount !== undefined
            ? dto.netAmount === null
              ? null
              : this.toDecimal(dto.netAmount)
            : undefined,
      },
      include: this.defaultInclude(),
    });
  }

  async updateStatus(id: string, status: SaleStatus) {
    const current = await this.ensureExists(id);

    if (current.status === SaleStatus.CANCELED && status !== SaleStatus.CANCELED) {
      throw new BadRequestException(
        'Vendas canceladas não podem retornar para estados ativos por esta rota.',
      );
    }

    if (status === SaleStatus.PAYMENT_CONFIRMED && current.billingRecordId) {
      const billingRecord = await this.prisma.billingRecord.findUnique({
        where: { id: current.billingRecordId },
        select: { status: true },
      });

      if (billingRecord?.status !== BillingStatus.PAYMENT_CONFIRMED) {
        throw new BadRequestException(
          'O faturamento precisa estar liquidado antes de confirmar o pagamento da venda.',
        );
      }
    }

    return this.prisma.sale.update({
      where: { id },
      data: { status },
      include: this.defaultInclude(),
    });
  }

  async markAsBilled(id: string, billingRecordId: string) {
    await this.ensureExists(id);

    const billingRecord = await this.prisma.billingRecord.findUnique({
      where: { id: billingRecordId },
      select: { id: true },
    });

    if (!billingRecord) {
      throw new NotFoundException('Registro de faturamento não encontrado.');
    }

    return this.prisma.sale.update({
      where: { id },
      data: {
        billingRecordId,
        status: SaleStatus.BILLED,
      },
      include: this.defaultInclude(),
    });
  }

  async syncStatusFromBilling(id: string) {
    const sale = await this.ensureExists(id);

    if (!sale.billingRecordId) {
      throw new BadRequestException(
        'A venda informada ainda não possui faturamento vinculado.',
      );
    }

    const billingRecord = await this.prisma.billingRecord.findUnique({
      where: { id: sale.billingRecordId },
      select: { status: true },
    });

    if (!billingRecord) {
      throw new NotFoundException('Registro de faturamento não encontrado.');
    }

    const status =
      billingRecord.status === BillingStatus.PAYMENT_CONFIRMED
        ? SaleStatus.PAYMENT_CONFIRMED
        : SaleStatus.BILLED;

    return this.prisma.sale.update({
      where: { id },
      data: { status },
      include: this.defaultInclude(),
    });
  }

  async remove(id: string) {
    const sale = await this.ensureExists(id);

    if (sale.billingRecordId) {
      throw new BadRequestException(
        'Não é possível remover uma venda já vinculada a faturamento.',
      );
    }

    await this.prisma.sale.delete({ where: { id } });

    if (sale.opportunityId) {
      await this.prisma.opportunity.update({
        where: { id: sale.opportunityId },
        data: {
          stage: OpportunityStage.QUALIFIED,
          wonAt: null,
        },
      });
    }

    return {
      message: 'Venda removida com sucesso.',
      id,
    };
  }

  private buildWhere(filters: ListSalesQueryDto): Prisma.SaleWhereInput {
    return {
      operatorId: filters.operatorId,
      partnerId: filters.partnerId,
      clientId: filters.clientId,
      productCatalogId: filters.productCatalogId,
      status: filters.status,
    };
  }

  private async validateReferences(dto: CreateSaleDto, ignoreSaleId?: string) {
    await this.ensureOperatorExists(dto.operatorId);
    await this.ensurePartnerExists(dto.partnerId);
    await this.ensureClientExists(dto.clientId);

    if (dto.productCatalogId) {
      const productCatalog = await this.prisma.productCatalog.findUnique({
        where: { id: dto.productCatalogId },
        select: { id: true, operatorId: true },
      });

      if (!productCatalog) {
        throw new NotFoundException('Produto de catálogo não encontrado.');
      }

      if (productCatalog.operatorId !== dto.operatorId) {
        throw new BadRequestException(
          'A venda deve usar um produto pertencente à mesma operadora.',
        );
      }
    }

    if (dto.opportunityId) {
      const opportunity = await this.prisma.opportunity.findUnique({
        where: { id: dto.opportunityId },
        select: {
          id: true,
          operatorId: true,
          partnerId: true,
          clientId: true,
          productCatalogId: true,
          sale: { select: { id: true } },
        },
      });

      if (!opportunity) {
        throw new NotFoundException('Oportunidade não encontrada para a venda.');
      }

      if (opportunity.sale && opportunity.sale.id !== ignoreSaleId) {
        throw new BadRequestException(
          'A oportunidade informada já possui uma venda vinculada.',
        );
      }

      if (opportunity.operatorId !== dto.operatorId) {
        throw new BadRequestException(
          'A venda deve pertencer à mesma operadora da oportunidade.',
        );
      }

      if (
        dto.partnerId &&
        opportunity.partnerId &&
        dto.partnerId !== opportunity.partnerId
      ) {
        throw new BadRequestException(
          'O partner informado não corresponde ao partner da oportunidade.',
        );
      }

      if (dto.clientId && opportunity.clientId && dto.clientId !== opportunity.clientId) {
        throw new BadRequestException(
          'O cliente informado não corresponde ao cliente da oportunidade.',
        );
      }

      if (
        dto.productCatalogId &&
        opportunity.productCatalogId &&
        dto.productCatalogId !== opportunity.productCatalogId
      ) {
        throw new BadRequestException(
          'O produto informado não corresponde ao produto da oportunidade.',
        );
      }
    }

    let rule: {
      id: string;
      operatorId: string;
      productCatalogId: string;
      operatorPercentage: Prisma.Decimal;
      partnerPercentage: Prisma.Decimal;
      platformPercentage: Prisma.Decimal;
    } | null = null;

    if (dto.commercialRuleId) {
      rule = await this.prisma.commercialRule.findUnique({
        where: { id: dto.commercialRuleId },
        select: {
          id: true,
          operatorId: true,
          productCatalogId: true,
          operatorPercentage: true,
          partnerPercentage: true,
          platformPercentage: true,
        },
      });

      if (!rule) {
        throw new NotFoundException('Regra comercial não encontrada.');
      }

      if (rule.operatorId !== dto.operatorId) {
        throw new BadRequestException(
          'A regra comercial deve pertencer à mesma operadora da venda.',
        );
      }

      if (dto.productCatalogId && rule.productCatalogId !== dto.productCatalogId) {
        throw new BadRequestException(
          'A regra comercial deve corresponder ao produto da venda.',
        );
      }
    } else if (dto.productCatalogId) {
      rule = await this.prisma.commercialRule.findUnique({
        where: { productCatalogId: dto.productCatalogId },
        select: {
          id: true,
          operatorId: true,
          productCatalogId: true,
          operatorPercentage: true,
          partnerPercentage: true,
          platformPercentage: true,
        },
      });
    }

    return rule;
  }

  private async createSplitAllocations(
    tx: Prisma.TransactionClient,
    billingRecordId: string,
    grossAmount: number,
    operatorId: string,
    partnerId: string | undefined,
    rule: {
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

    await tx.splitAllocation.createMany({ data: allocations });
  }

  private defaultInclude() {
    return {
      operator: {
        select: {
          id: true,
          legalName: true,
          tradeName: true,
          status: true,
        },
      },
      partner: {
        select: {
          id: true,
          companyName: true,
          partnerLevel: true,
          status: true,
        },
      },
      client: {
        select: {
          id: true,
          companyName: true,
          document: true,
          status: true,
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
      commercialRule: {
        select: {
          id: true,
          operatorPercentage: true,
          partnerPercentage: true,
          platformPercentage: true,
        },
      },
      opportunity: {
        select: {
          id: true,
          title: true,
          stage: true,
        },
      },
      billingRecord: {
        select: {
          id: true,
          status: true,
          splitStatus: true,
        },
      },
    };
  }

  private async ensureExists(id: string) {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      select: {
        id: true,
        opportunityId: true,
        operatorId: true,
        partnerId: true,
        clientId: true,
        productCatalogId: true,
        commercialRuleId: true,
        billingRecordId: true,
        title: true,
        description: true,
        grossAmount: true,
        netAmount: true,
        externalReference: true,
        status: true,
      },
    });

    if (!sale) {
      throw new NotFoundException('Venda não encontrada.');
    }

    return sale;
  }

  private async ensureOperatorExists(operatorId: string) {
    const operator = await this.prisma.operator.findUnique({
      where: { id: operatorId },
      select: { id: true },
    });

    if (!operator) {
      throw new NotFoundException('Operadora não encontrada.');
    }
  }

  private async ensurePartnerExists(partnerId?: string) {
    if (!partnerId) {
      return;
    }

    const partner = await this.prisma.partner.findUnique({
      where: { id: partnerId },
      select: { id: true },
    });

    if (!partner) {
      throw new NotFoundException('Partner não encontrado.');
    }
  }

  private async ensureClientExists(clientId?: string) {
    if (!clientId) {
      return;
    }

    const client = await this.prisma.client.findUnique({
      where: { id: clientId },
      select: { id: true },
    });

    if (!client) {
      throw new NotFoundException('Cliente não encontrado.');
    }
  }

  private calculateAmount(amount: number, percentage: number) {
    return this.toDecimal((amount * percentage) / 100);
  }

  private toDecimal(value: number) {
    return new Prisma.Decimal(value.toFixed(2));
  }
}
