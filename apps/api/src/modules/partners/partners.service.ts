import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PartnersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.partner.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        companyName: true,
        document: true,
        partnerLevel: true,
        score: true,
        status: true,
        createdAt: true,
      },
    });
  }

  async findById(id: string) {
    const partner = await this.prisma.partner.findUnique({
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
        onboardings: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!partner) {
      throw new NotFoundException('Partner não encontrado.');
    }

    return partner;
  }
}
