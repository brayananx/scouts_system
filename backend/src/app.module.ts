import { Module } from '@nestjs/common';
import { UsersModule } from './users/users.module';
import { PrismaModule } from './prisma/prisma.module';
import { SectionModule } from './section/section.module';

@Module({
  imports: [PrismaModule, UsersModule, SectionModule],
})
export class AppModule {}