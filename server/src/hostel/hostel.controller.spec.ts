import { Test, TestingModule } from '@nestjs/testing';
import { HostelController } from './hostel.controller';
import { HostelService } from './hostel.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';

describe('HostelController', () => {
  let controller: HostelController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [HostelController],
      providers: [
        {
          provide: HostelService,
          useValue: {
            findAllForStudent: jest.fn(),
            findAll: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<HostelController>(HostelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
