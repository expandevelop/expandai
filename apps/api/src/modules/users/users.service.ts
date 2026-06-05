import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe() {
    const user = await this.prisma.user.findFirst({
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ecosystemProfile: true,
        status: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Nenhum usuário foi encontrado na base da ExpandAI.');
    }

    return user;
  }

  listRoles() {
    return {
      roles: ['admin', 'operator', 'partner', 'client'],
    };
  }
}
