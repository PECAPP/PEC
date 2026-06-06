import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
  genSalt: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            findById: jest.fn(),
            updateById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            role: {
              upsert: jest.fn(),
            },
            userRole: {
              create: jest.fn(),
              deleteMany: jest.fn(),
            },
            refreshToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              updateMany: jest.fn(),
            },
            emailVerificationToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            passwordResetToken: {
              create: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            $transaction: jest.fn(async (arg: any) => {
              if (typeof arg === 'function') {
                return arg({
                  user: {
                    create: jest.fn(),
                    update: jest.fn(),
                  },
                  role: { upsert: jest.fn() },
                  userRole: {
                    create: jest.fn(),
                    deleteMany: jest.fn(),
                  },
                });
              }
              return Promise.all(arg);
            }),
          },
        },
      ],
    }).compile();

    service = moduleRef.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('signIn should return tokens for valid credentials', async () => {
    const usersService = moduleRef.get<UsersService>(UsersService);
    const prisma = moduleRef.get<PrismaService>(PrismaService);
    const jwt = moduleRef.get<JwtService>(JwtService);

    const user = {
      id: 'user-1',
      email: 'student@pec.edu',
      name: 'Student',
      password: 'hashed',
      role: 'student',
      avatar: null,
      profileComplete: true,
      emailVerified: true,
      sessionVersion: 0,
      passwordChangedAt: null,
      failedLoginAttempts: 0,
      lockedUntil: null,
      roles: [{ role: { name: 'student' } }],
    } as any;

    jest.spyOn(usersService, 'findOne').mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true as any);
    jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user as any);
    jest.spyOn(prisma.refreshToken, 'create').mockResolvedValue({} as any);
    jest.spyOn(jwt, 'signAsync').mockResolvedValue('access-token' as any);

    const result = await service.signIn('student@pec.edu', 'password', {});

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toEqual(expect.any(String));
    expect(result.user.uid).toBe(user.id);
    expect(result.user.role).toBe('student');
  });

  it('refreshSession should rotate refresh tokens', async () => {
    const prisma = moduleRef.get<PrismaService>(PrismaService);
    const jwt = moduleRef.get<JwtService>(JwtService);

    const tokenRecord = {
      id: 'refresh-1',
      tokenHash: 'hash',
      familyId: 'family-1',
      revokedAt: null,
      expiresAt: new Date(Date.now() + 60_000),
      userId: 'user-1',
      user: {
        id: 'user-1',
        email: 'student@pec.edu',
        name: 'Student',
        role: 'student',
        avatar: null,
        profileComplete: true,
        emailVerified: true,
        sessionVersion: 0,
        passwordChangedAt: null,
        roles: [{ role: { name: 'student' } }],
      },
    } as any;

    jest.spyOn(prisma.refreshToken, 'findUnique').mockResolvedValue(tokenRecord);
    jest.spyOn(prisma.refreshToken, 'update').mockResolvedValue({} as any);
    jest
      .spyOn(prisma, '$transaction')
      .mockResolvedValue([{ id: 'refresh-2' }] as any);
    jest.spyOn(jwt, 'signAsync').mockResolvedValue('access-token' as any);

    const result = await service.refreshSession('raw-refresh', {});

    expect(result.access_token).toBe('access-token');
    expect(result.refresh_token).toEqual(expect.any(String));
    expect(result.user.uid).toBe('user-1');
  });
});
