import { Controller, Get, Post, Body } from '@nestjs/common';
import { SectionService } from './section.service';

@Controller('sections')
export class SectionController {
  constructor(private readonly sectionService: SectionService) {}

  @Post()
  create(@Body() body: { name: string }) {
    return this.sectionService.create(body.name);
  }

  @Get()
  findAll() {
    return this.sectionService.findAll();
  }
}