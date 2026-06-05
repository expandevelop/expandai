import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OpportunityStage, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOpportunityDto } from './dto/create-opportunity.dto';
import { ListOpportunitiesQueryDto } from './dto/list-opportunities-query.dto';
import { UpdateOpportunityDto } from './dto/update-opportunity.dto';

@Injectable()
export class OpportunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(filters: ListOpportunitiesQueryDto = {}) {
    return this.prisma.opportunity.findMany({
      where: this.buildWhere(filters),
      orderBy: [{ stage: 'asc' }, { createdAt: 'desc' }],
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
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        ...this.defaultInclude(),
        sale: {
          select: {
            id: true,
            status: true,
            grossAmount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }

    return opportunity;
  }

  async create(dto: CreateOpportunityDto) {
    await this.ensureOperatorExists(dto.operatorId);
    await this.ensurePartnerExists(dto.partnerId);
    await this.ensureClientExists(dto.clientId);
    await this.ensureProductCatalogConsistency(dto.operatorId, dto.productCatalogId);

    return this.prisma.opportunity.create({
      data: {
        operatorId: dto.operatorId,
        partnerId: dto.partnerId,
        clientId: dto.clientId,
        productCatalogId: dto.productCatalogId,
        title: dto.title,
        description: dto.description,
        source: dto.source,
        stage: OpportunityStage.NEW,
        estimatedValue: this.toDecimal(dto.estimatedValue ?? 0),
        closeExpectedAt: dto.closeExpectedAt ? new Date(dto.closeExpectedAt) : null,
      },
      include: this.defaultInclude(),
    });
  }

  async update(id: string, dto: UpdateOpportunityDto) {
    const current = await this.ensureExists(id);

    const operatorId = dto.operatorId ?? current.operatorId;
    const partnerId = dto.partnerId ?? current.partnerId ?? undefined;
    const clientId = dto.clientId ?? current.clientId ?? undefined;
    const productCatalogId = dto.productCatalogId ?? current.productCatalogId ?? undefined;

    await this.ensureOperatorExists(operatorId);
    await this.ensurePartnerExists(partnerId);
    await this.ensureClientExists(clientId);
    await this.ensureProductCatalogConsistency(operatorId, productCatalogId);
    this.ensureStageMutationAllowed(current.stage, dto.stage);

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        operatorId: dto.operatorId,
        partnerId: dto.partnerId,
        clientId: dto.clientId,
        productCatalogId: dto.productCatalogId,
        title: dto.title,
        description: dto.description,
        source: dto.source,
        stage: dto.stage,
        estimatedValue:
          dto.estimatedValue !== undefined
            ? this.toDecimal(dto.estimatedValue)
            : undefined,
        closeExpectedAt:
          dto.closeExpectedAt !== undefined
            ? dto.closeExpectedAt
              ? new Date(dto.closeExpectedAt)
              : null
            : undefined,
        wonAt: dto.stage === OpportunityStage.WON ? new Date() : undefined,
        lostReason:
          dto.stage === OpportunityStage.LOST
            ? dto.lostReason ?? 'Perdida sem motivo informado.'
            : dto.stage
              ? null
              : undefined,
      },
      include: this.defaultInclude(),
    });
  }

  async updateStage(id: string, stage: OpportunityStage, reason?: string) {
    const current = await this.ensureExists(id);
    this.ensureStageMutationAllowed(current.stage, stage);

    return this.prisma.opportunity.update({
      where: { id },
      data: {
        stage,
        wonAt: stage === OpportunityStage.WON ? new Date() : null,
        lostReason:
          stage === OpportunityStage.LOST
            ? reason ?? 'Perdida sem motivo informado.'
            : null,
      },
      include: this.defaultInclude(),
    });
  }

  async markAsWon(id: string) {
    return this.updateStage(id, OpportunityStage.WON);
  }

  async markAsLost(id: string, reason?: string) {
    return this.updateStage(id, OpportunityStage.LOST, reason);
  }

  async remove(id: string) {
    const opportunity = await this.ensureExists(id);

    if (opportunity.sale) {
      throw new BadRequestException(
        'Não é possível remover uma oportunidade que já possui venda vinculada.',
      );
    }

    await this.prisma.opportunity.delete({
      where: { id },
    });

    return {
      message: 'Oportunidade removida com sucesso.',
      id,
    };
  }

  private buildWhere(filters: ListOpportunitiesQueryDto): Prisma.OpportunityWhereInput {
    return {
      operatorId: filters.operatorId,
      partnerId: filters.partnerId,
      clientId: filters.clientId,
      productCatalogId: filters.productCatalogId,
      stage: filters.stage,
    };
  }

  private ensureStageMutationAllowed(
    currentStage: OpportunityStage,
    nextStage?: OpportunityStage,
  ) {
    if (!nextStage || currentStage === nextStage) {
      return;
    }

    if (
      currentStage === OpportunityStage.WON &&
      nextStage !== OpportunityStage.WON
    ) {
      throw new BadRequestException(
        'Oportunidades já ganhas não podem retornar para estágios anteriores por esta rota.',
      );
    }
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
    };
  }

  private async ensureExists(id: string) {
    const opportunity = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        sale: {
          select: { id: true },
        },
      },
    });

    if (!opportunity) {
      throw new NotFoundException('Oportunidade não encontrada.');
    }

    return opportunity;
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

  private async ensureProductCatalogConsistency(
    operatorId: string,
    productCatalogId?: string,
  ) {
    if (!productCatalogId) {
      return;
    }

    const productCatalog = await this.prisma.productCatalog.findUnique({
      where: { id: productCatalogId },
      select: { id: true, operatorId: true },
    });

    if (!productCatalog) {
      throw new NotFoundException('Produto de catálogo não encontrado.');
    }

    if (productCatalog.operatorId !== operatorId) {
      throw new BadRequestException(
        'A oportunidade deve usar um produto pertencente à mesma operadora.',
      );
    }
  }

  private toDecimal(value: number) {
    return new Prisma.Decimal(value.toFixed(2));
  }
}
