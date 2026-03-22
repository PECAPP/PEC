import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
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
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
