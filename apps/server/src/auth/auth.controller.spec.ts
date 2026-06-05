import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const moduleBuilder = Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signIn: jest.fn(),
            signUp: jest.fn(),
            refreshSession: jest.fn(),
            logout: jest.fn(),
            verifyEmail: jest.fn(),
            requestPasswordReset: jest.fn(),
            resetPassword: jest.fn(),
            getProfile: jest.fn(),
            completeProfile: jest.fn(),
            changePassword: jest.fn(),
            setRole: jest.fn(),
          },
        },
        {
          provide: 'JwtService',
          useValue: {
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: 'PrismaService',
          useValue: {},
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) });

    const module: TestingModule = await moduleBuilder.compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
