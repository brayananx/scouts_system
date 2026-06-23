import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; email: string; role?: string }) {
    return this.prisma.user.create({ data });
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  async assignSection(userId: string, sectionId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { sectionId },
  });
}
  assignPatrol(userId: string, patrolId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { patrolId },
  });
}
}