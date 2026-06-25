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
      progress: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
    },
  });
}
findOne(id: string) {
  return this.prisma.user.findUnique({
    where: { id },
    include: {
      patrol: true,
      section: true,
      specialties: {
        include: {
          specialty: true,
        },
      },
      progress: {
        orderBy: [
          { type: 'asc' },
          { level: 'asc' },
        ],
      },
    },
  });
}

addProgress(
  id: string,
  data: {
    type: 'COMPASS' | 'LOGBOOK';
    level: number;
    obtainedDate: string;
  },
) {
  return this.prisma.userProgress.create({
    data: {
      userId: id,
      type: data.type,
      level: Number(data.level),
      obtainedDate: new Date(data.obtainedDate),
    },
  });
}

removeProgress(progressId: string) {
  return this.prisma.userProgress.delete({
    where: { id: progressId },
  });
}

  async assignSection(userId: string, sectionId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { sectionId },
  });
}

  async getHistoryData(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        patrol: true,
        medicalRecord: true,
        progress: {
          orderBy: {
            obtainedDate: "asc",
          },
        },

        specialties: {
          include: {
            specialty: true,
          },
        },
      },
    });
  }
  assignPatrol(userId: string, patrolId: string) {
  return this.prisma.user.update({
    where: { id: userId },
    data: { patrolId },
  });
}

async remove(id: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.medicalRecord.deleteMany({
        where: { userId: id },
      });

      await tx.progressHistory.deleteMany({
        where: { userId: id },
      });

      await tx.userSpecialty.deleteMany({
        where: { userId: id },
      });

      await tx.attendance.deleteMany({
        where: { userId: id },
      });

      return tx.user.delete({
        where: { id },
      });
    });
  }

updateStatus(
    id: string,
    data: {
      isActive: boolean;
      inactiveReason?: string;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data: {
        isActive: data.isActive,
        inactiveReason: data.isActive ? null : data.inactiveReason,
        inactiveDate: data.isActive ? null : new Date(),

        // Si queda inactivo, sale de la patrulla
        patrolId: data.isActive ? undefined : null,
      },
    });
  }
  updateProgress(
    id: string,
    data: {
      compassLevel?: number;
      logbookLevel?: number;
    },
  ) {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
  updateScoutCeremony(
  id: string,
  data: {
    isInvested?: boolean;
    promiseDate?: string | null;
  },
) {
  return this.prisma.user.update({
    where: { id },
    data: {
      isInvested: data.isInvested,
      promiseDate: data.promiseDate ? new Date(data.promiseDate) : null,
    },
  });
}
}