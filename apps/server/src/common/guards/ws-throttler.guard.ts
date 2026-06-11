import { Injectable, ExecutionContext } from '@nestjs/common';
import { ThrottlerException, ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class WsThrottlerGuard extends ThrottlerGuard {
  async handleRequest(
    context: ExecutionContext,
    limit: number,
    ttl: number,
    throttler: any,
  ): Promise<boolean> {
    const client = context.switchToWs().getClient();
    // Usually socket.io clients have handshake.headers or handshake.address
    const ip = client.handshake?.address || client.conn?.remoteAddress || 'unknown-ip';
    
    const key = this.generateKey(context, ip, throttler.name);
    
    // Check limit
    const { totalHits } = await this.storageService.increment(key, ttl);
    
    if (totalHits > limit) {
      throw new ThrottlerException();
    }
    
    return true;
  }
}
