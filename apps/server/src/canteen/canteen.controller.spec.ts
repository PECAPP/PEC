import { Test, TestingModule } from '@nestjs/testing';
import { CanteenController } from './canteen.controller';
import { CanteenService } from './canteen.service';
import { AuthGuard } from '../auth/auth.guard';

describe('CanteenController', () => {
  let controller: CanteenController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [CanteenController],
      providers: [
        {
          provide: CanteenService,
          useValue: {
            findAllItems: jest.fn(),
            findAllOrders: jest.fn(),
            createOrder: jest.fn(),
          },
        },
      ],
    }).overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<CanteenController>(CanteenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
