import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';


@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: any) {
    return this.usersService.create(body);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch('assign-section')
  assignSection(@Body() body: { userId: string; sectionId: string }) {
    return this.usersService.assignSection(body.userId, body.sectionId);
  }
  @Patch('assign-patrol')
  assignPatrol(@Body() body: { userId: string; patrolId: string }) {
    return this.usersService.assignPatrol(body.userId, body.patrolId);
  }
  @Post(':id/progress-history')
    addProgress(
      @Param('id') id: string,
      @Body()
      body: {
        type: 'COMPASS' | 'LOGBOOK';
        level: number;
        obtainedDate: string;
      },
    ) {
      return this.usersService.addProgress(id, body);
    }

  @Delete('progress-history/:progressId')
    removeProgress(@Param('progressId') progressId: string) {
      return this.usersService.removeProgress(progressId);
    }

  @Patch(':id/progress')
  updateProgress(
    @Param('id') id: string,
    @Body()
    body: {
      compassLevel?: number;
      logbookLevel?: number;
    },
  ) {
    return this.usersService.updateProgress(id, body);
  }
}