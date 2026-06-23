import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SectionService {
  constructor(private prisma: PrismaService) {}

  create(name: string) {
    return this.prisma.section.create({
      data: { name },
    });
  }

  findAll() {
  return this.prisma.section.findMany({
    include: {
      users: true,
    },
  });
}
}