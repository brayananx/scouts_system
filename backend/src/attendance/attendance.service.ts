import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceService {
  constructor(private prisma: PrismaService) {}

  getActivities() {
    return this.prisma.activity.findMany({
      orderBy: {
        date: 'desc',
      },
      include: {
        attendance: true,
      },
    });
  }

  createActivity(body: {
    name: string;
    date: string;
    description?: string;
  }) {
    return this.prisma.activity.create({
      data: {
        name: body.name,
        date: new Date(body.date),
        description: body.description,
      },
    });
  }

  async getActivity(id: string) {
    const activity = await this.prisma.activity.findUnique({
      where: { id },
    });

    const activeUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        name: 'asc',
      },
      include: {
        patrol: true,
      },
    });

    const attendance = await this.prisma.attendance.findMany({
      where: {
        activityId: id,
      },
      include: {
        user: {
          include: {
            patrol: true,
          },
        },
      },
    });

    const inactiveUsersWithAttendance = attendance
      .filter((a) => a.user.isActive === false)
      .map((a) => a.user);

    const usersMap = new Map();

    [...activeUsers, ...inactiveUsersWithAttendance].forEach((user) => {
      usersMap.set(user.id, user);
    });

    const users = Array.from(usersMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return {
      activity,
      users,
      attendance,
    };
  }

  async markAttendance(
    activityId: string,
    userId: string,
    present: boolean,
  ) {
    return this.prisma.attendance.upsert({
      where: {
        activityId_userId: {
          activityId,
          userId,
        },
      },
      update: {
        present,
      },
      create: {
        activityId,
        userId,
        present,
      },
    });
  }
}