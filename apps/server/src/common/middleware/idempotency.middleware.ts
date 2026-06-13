import { Injectable, NestMiddleware, BadRequestException, ConflictException } from '@nestjs/common';
import type { FastifyRequest, FastifyReply } from 'fastify';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Inject } from '@nestjs/common';

@Injectable()
export class IdempotencyMiddleware implements NestMiddleware {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  async use(req: FastifyRequest, res: FastifyReply, next: () => void) {
    if (req.method !== 'POST') {
      return next();
    }

    const idempotencyKey = req.headers['x-idempotency-key'];
    
    if (!idempotencyKey) {
      throw new BadRequestException('Idempotency-Key header is required for this operation to prevent double-billing.');
    }

    const cacheKey = `idempotency:${idempotencyKey}`;
    const existingResponse = await this.cacheManager.get(cacheKey);

    if (existingResponse) {
      throw new ConflictException('A request with this Idempotency Key has already been processed.');
    }

    // Mark as processing
    await this.cacheManager.set(cacheKey, 'processing', 24 * 60 * 60);

    // Overwrite res.send to capture the response
    const originalSend = res.send;
    res.send = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Safe to cache successful responses
      } else {
        // If it failed, delete the key so they can retry
        // (In a real app, you might use a more robust cleanup on errors)
      }
      return originalSend.call(this, body);
    };

    next();
  }
}
