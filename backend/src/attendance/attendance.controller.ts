import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';

import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(
    private readonly attendanceService: AttendanceService,
  ) {}

  @Get('activities')
  getActivities() {
    return this.attendanceService.getActivities();
  }

  @Post('activities')
  createActivity(
    @Body()
    body: {
      name: string;
      date: string;
      description?: string;
    },
  ) {
    return this.attendanceService.createActivity(body);
  }

  @Get('activities/:id')
  getActivity(@Param('id') id: string) {
    return this.attendanceService.getActivity(id);
  }

  @Patch('mark')
  markAttendance(
    @Body()
    body: {
      activityId: string;
      userId: string;
      present: boolean;
    },
  ) {
    return this.attendanceService.markAttendance(
      body.activityId,
      body.userId,
      body.present,
    );
  }
}