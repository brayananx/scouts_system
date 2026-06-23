import { Body, Controller, Get, Post } from '@nestjs/common';
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
}