import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { SpecialtiesService } from './specialties.service';

@Controller('specialties')
export class SpecialtiesController {
  constructor(private readonly specialtiesService: SpecialtiesService) {}

  @Post()
    create(@Body() body: { name: string; imageKey: string }) {
    return this.specialtiesService.create(body.name, body.imageKey);
  }

  @Get()
  findAll() {
    return this.specialtiesService.findAll();
  }

  @Post('assign')
  assignToUser(
    @Body()
    body: {
      userId: string;
      specialtyId: string;
      obtainedDate?: string;
    },
  ) {
    return this.specialtiesService.assignToUser(
      body.userId,
      body.specialtyId,
      body.obtainedDate,
    );
  }

  @Delete('user-specialty/:id')
  removeFromUser(@Param('id') id: string) {
    return this.specialtiesService.removeFromUser(id);
  }
}