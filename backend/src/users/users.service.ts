import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  create(data: {
  name: string;
  email: string;
  identityNumber: string;
  role?: string;
  birthDate?: string;
  joinDate?: string;
}) {
  return this.prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      identityNumber: data.identityNumber,
      role: data.role || 'scout',
      birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
      joinDate: data.joinDate ? new Date(data.joinDate) : undefined,
    },
  });
}

  findAll() {
  return this.prisma.user.findMany({
    include: {
      section: true,
      patrol: true,
    },
  });
}
findOne(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    include: {
      patrol: true,
      section: true,
    },
  });
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