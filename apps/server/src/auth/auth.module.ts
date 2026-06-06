import { Module, Global } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { jwtConstants } from './constants';
import { AuthGuard } from './auth.guard';
import { RolesGuard } from './roles.guard';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { PrismaModule } from '../prisma/prisma.module';
import { PoliciesGuard } from './guards/policies.guard';
import { CaslModule } from '../casl/casl.module';

@Global()
@Module({
  imports: [
    CaslModule,
    UsersModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '60m' },
    }),
    CacheModule.register({
      isGlobal: true,
      store: redisStore,
      url: process.env.REDIS_URL || 'redis://localhost:6380',
      ttl: 60 * 5, // 5 minutes cache
    }),
  ],
  providers: [AuthService, AuthGuard, RolesGuard, PoliciesGuard],
  controllers: [AuthController],
  exports: [AuthService, AuthGuard, RolesGuard, PoliciesGuard, CacheModule],
})
export class AuthModule {}
