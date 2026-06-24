import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SectionModule } from './section/section.module';
import { PatrolModule } from './patrol/patrol.module';
import { SpecialtiesModule } from './specialties/specialties.module';
import { MedicalRecordsModule } from './medical-records/medical-records.module';
import { AttendanceModule } from './attendance/attendance.module';

@Module({
  imports: [PrismaModule, UsersModule, SectionModule, PatrolModule, SpecialtiesModule, MedicalRecordsModule, AttendanceModule],
})
export class AppModule {}