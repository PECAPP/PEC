import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { SkipThrottle } from '@nestjs/throttler';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * Health endpoint for Docker HEALTHCHECK and load balancer probes.
   * Returns 200 OK when the app is ready to serve traffic.
   * Fix #22: The Docker healthcheck now targets this endpoint instead of
   * the root route, ensuring the app is actually functional, not just listening.
   */
  @SkipThrottle()
  @Get('health')
  health(): { status: string; uptime: number; timestamp: string } {
    return {
      status: 'ok',
      uptime: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }
}
