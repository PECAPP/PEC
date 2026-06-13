import { Injectable } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(requestProps: any): Promise<boolean> {
    const { context, limit, ttl, throttler } = requestProps;
    const client = context.switchToWs().getClient();
    const ip = client.handshake?.address || client.conn?.remoteAddress || 'unknown-ip';
    
    const key = this.generateKey(context, ip, throttler.name);
    
    // in the latest throttler, but often just (key, value, ...). Wait, storageService.increment(key, value, limit, ttl)
    // Actually the signature usually is increment(key, ttl, limit, blockDuration, throttlerName)
    const { totalHits } = await this.storageService.increment(key, ttl, limit, 0, throttler.name);
    
    if (totalHits > limit) {
      throw new ThrottlerException();
    }
    
    return true;
  }
}
