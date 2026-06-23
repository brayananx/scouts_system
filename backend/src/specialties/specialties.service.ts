import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SpecialtiesService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.specialty.create({
      data: { name },
    });
  }

  findAll() {
    return this.prisma.specialty.findMany({
      orderBy: { name: 'asc' },
    });
  }

  assignToUser(userId: string, specialtyId: string, obtainedDate?: string) {
    return this.prisma.userSpecialty.create({
      data: {
        userId,
        specialtyId,
        obtainedDate: obtainedDate ? new Date(obtainedDate) : undefined,
      },
      include: {
        specialty: true,
      },
    });
  }

  removeFromUser(userSpecialtyId: string) {
    return this.prisma.userSpecialty.delete({
      where: { id: userSpecialtyId },
    });
  }
}