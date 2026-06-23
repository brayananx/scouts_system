import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SectionModule } from './section/section.module';
import { PatrolModule } from './patrol/patrol.module';

@Module({
  imports: [PrismaModule, UsersModule, SectionModule, PatrolModule],
})
export class AppModule {}