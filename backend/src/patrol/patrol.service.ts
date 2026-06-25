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
    const usersInPatrol = await this.prisma.user.count({
      where: { patrolId: id },
    });

    if (usersInPatrol > 0) {
      throw new BadRequestException(
        "No se puede eliminar esta patrulla porque tiene protagonistas asignados."
      );
    }

    return this.prisma.patrol.delete({
      where: { id },
    });
  }

  update(id: string, name: string) {
    return this.prisma.patrol.update({
      where: { id },
      data: {
        name,
      },
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