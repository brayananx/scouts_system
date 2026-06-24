import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  findOne(userId: string) {
    return this.prisma.medicalRecord.findUnique({
      where: { userId },
    });
  }

  update(userId: string, data: any) {
    return this.prisma.medicalRecord.upsert({
      where: { userId },
      update: data,
      create: {
        userId,
        ...data,
      },
    });
  }
}