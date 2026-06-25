import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SectionModule } from './section/section.module';
import { PatrolModule } from './patrol/patrol.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { AttendanceModule } from './attendance/attendance.module';
import { AuthModule } from './auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/jwt-auth.guard';

@Module({
  imports: [PrismaModule, UsersModule, SectionModule, PatrolModule, SpecialtiesModule, MedicalRecordsModule, AttendanceModule, AuthModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}