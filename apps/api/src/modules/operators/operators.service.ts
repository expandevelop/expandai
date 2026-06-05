import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class OperatorsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.operator.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        legalName: true,
        document: true,
        status: true,
        email: true,
        phone: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    const operator = await this.prisma.operator.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            status: true,
          },
        },
        productCatalogs: true,
        onboardings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!operator) {
      throw new NotFoundException('Operadora não encontrada.');
    }

    return operator;
  }
}
