import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MedicalRecordsService {
  constructor(private prisma: PrismaService) {}

  async findOne(userId: string) {
    const record = await this.prisma.medicalRecord.findUnique({
      where: {
        userId,
      },
    });

    return record || {};
  }
  getUserMedicalData(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        patrol: true,
        medicalRecord: true,
      },
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