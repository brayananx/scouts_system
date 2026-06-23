import { Test, TestingModule } from '@nestjs/testing';
import { PatrolController } from './patrol.controller';

describe('PatrolController', () => {
  let controller: PatrolController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PatrolController],
    }).compile();

    controller = module.get<PatrolController>(PatrolController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
