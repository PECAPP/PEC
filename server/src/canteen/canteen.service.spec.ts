import { Test, TestingModule } from '@nestjs/testing';
import { CanteenService } from './canteen.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CanteenService', () => {
  let service: CanteenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CanteenService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CanteenService>(CanteenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
