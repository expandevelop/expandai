import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        ecosystemProfile: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException(
        'Usuário autenticado não foi encontrado na base da ExpandAI.',
      );
    }

    return user;
  }

  listRoles() {
    return {
      roles: ['admin', 'operator', 'partner', 'client'],
    };
  }
}
