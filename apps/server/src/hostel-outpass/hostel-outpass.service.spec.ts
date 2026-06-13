import { Test, TestingModule } from '@nestjs/testing';
import { HostelOutpassService } from './hostel-outpass.service';

describe('HostelOutpassService', () => {
  let service: HostelOutpassService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HostelOutpassService],
    }).compile();

    service = module.get<HostelOutpassService>(HostelOutpassService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
