import { Injectable, NotFoundException } from '@nestjs/common';
import { RecordStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProductCatalogDto } from './dto/create-product-catalog.dto';
import { UpdateProductCatalogDto } from './dto/update-product-catalog.dto';

@Injectable()
export class ProductCatalogsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.productCatalog.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            document: true,
            status: true,
          },
        },
      },
    });
  }

  findByOperatorId(operatorId: string) {
    return this.prisma.productCatalog.findMany({
      where: { operatorId },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    const productCatalog = await this.prisma.productCatalog.findUnique({
      where: { id },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            document: true,
            commissionModel: true,
            status: true,
          },
        },
      },
    });

    if (!productCatalog) {
      throw new NotFoundException('Produto do catálogo não encontrado.');
    }

    return productCatalog;
  }

  async create(dto: CreateProductCatalogDto) {
    const operator = await this.prisma.operator.findUnique({
      where: { id: dto.operatorId },
      select: { id: true, status: true, legalName: true, tradeName: true },
    });

    if (!operator) {
      throw new NotFoundException('Operadora vinculada ao catálogo não encontrada.');
    }

    return this.prisma.productCatalog.create({
      data: {
        operatorId: dto.operatorId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        commissionRule: dto.commissionRule,
        status: RecordStatus.PENDING,
      },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            status: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateProductCatalogDto) {
    await this.ensureExists(id);

    return this.prisma.productCatalog.update({
      where: { id },
      data: {
        operatorId: dto.operatorId,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        commissionRule: dto.commissionRule,
      },
      include: {
        operator: {
          select: {
            id: true,
            legalName: true,
            tradeName: true,
            status: true,
          },
        },
      },
    });
  }

  async activate(id: string) {
    await this.ensureExists(id);

    return this.prisma.productCatalog.update({
      where: { id },
      data: { status: RecordStatus.ACTIVE },
    });
  }

  async deactivate(id: string) {
    await this.ensureExists(id);

    return this.prisma.productCatalog.update({
      where: { id },
      data: { status: RecordStatus.INACTIVE },
    });
  }

  async remove(id: string) {
    await this.ensureExists(id);

    await this.prisma.productCatalog.delete({
      where: { id },
    });

    return {
      message: 'Produto removido do catálogo com sucesso.',
      id,
    };
  }

  private async ensureExists(id: string) {
    const productCatalog = await this.prisma.productCatalog.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!productCatalog) {
      throw new NotFoundException('Produto do catálogo não encontrado.');
    }
  }
}
