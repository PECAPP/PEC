import { Test, TestingModule } from '@nestjs/testing';
import { HostelOutpassController } from './hostel-outpass.controller';

describe('HostelOutpassController', () => {
  let controller: HostelOutpassController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HostelOutpassController],
    }).compile();

    controller = module.get<HostelOutpassController>(HostelOutpassController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
