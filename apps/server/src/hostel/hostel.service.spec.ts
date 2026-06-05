import { Test, TestingModule } from '@nestjs/testing';
import { HostelService } from './hostel.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HostelService', () => {
  let service: HostelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HostelService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HostelService>(HostelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
