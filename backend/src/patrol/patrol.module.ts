import { Module } from '@nestjs/common';
import { PatrolService } from './patrol.service';
import { PatrolController } from './patrol.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PatrolController],
  providers: [PatrolService],
})
export class PatrolModule {}