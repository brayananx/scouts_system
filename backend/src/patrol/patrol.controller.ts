import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { PatrolService } from './patrol.service';

@Controller('patrols')
export class PatrolController {
  constructor(private readonly patrolService: PatrolService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.patrolService.create(name);
  }

  @Get()
  findAll() {
    return this.patrolService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.patrolService.update(id, name);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.patrolService.remove(id);
  }
}