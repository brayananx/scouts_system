import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatrolService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.patrol.create({
      data: { name },
    });
  }
  async remove(id: string) {
    const usersCount = await this.prisma.user.count({
      where: { patrolId: id },
    });

    if (usersCount > 0) {
      throw new BadRequestException(
        'No se puede eliminar esta patrulla porque tiene usuarios asignados.',
      );
    }

    return this.prisma.patrol.delete({
      where: { id },
    });
  }

  findAll() {
    return this.prisma.patrol.findMany({
      include: {
        users: true,
      },
    });
  }
}