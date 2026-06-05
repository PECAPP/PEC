import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import * as redisStore from 'cache-manager-redis-store';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [
    PrismaModule,
    CacheModule.register({
      store: redisStore,
      url: process.env.REDIS_URL || 'redis://redis:6379',
      ttl: 60 * 5, // 5 minutes cache
    }),
  ],
  providers: [AdminService],
  controllers: [AdminController]
})
export class AdminModule {}
