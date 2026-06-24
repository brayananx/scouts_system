import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { MedicalRecordsService } from './medical-records.service';

@Controller('medical-records')
export class MedicalRecordsController {
  constructor(private readonly medicalRecordsService: MedicalRecordsService) {}

  @Get(':userId')
  findOne(@Param('userId') userId: string) {
    return this.medicalRecordsService.findOne(userId);
  }

  @Put(':userId')
  update(@Param('userId') userId: string, @Body() body: any) {
    return this.medicalRecordsService.update(userId, body);
  }
}