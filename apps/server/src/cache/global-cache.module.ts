import { Module, Global } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import Keyv from 'keyv';

/**
 * Global Redis cache module with a namespaced key prefix to prevent
 * collisions with other services sharing the same Redis instance (#17).
 *
 * All cache keys will be automatically prefixed with "pec:" by Keyv.
 */
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => {
        const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';
        const store = createKeyv(redisUrl, {
          namespace: 'pec', // Prevents key collisions with other Redis tenants
        });
        return {
          stores: [store as unknown as Keyv],
          ttl: 5 * 60 * 1000, // 5 minutes default TTL in ms
        };
      },
    }),
  ],
  exports: [CacheModule],
})
export class GlobalCacheModule {}
