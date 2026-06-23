import { Controller, Get, Post, Body, Patch } from '@nestjs/common';
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

  @Patch('assign-section')
  assignSection(@Body() body: { userId: string; sectionId: string }) {
    return this.usersService.assignSection(body.userId, body.sectionId);
  }
}