import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PatrolService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.patrol.create({
      data: { name },
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