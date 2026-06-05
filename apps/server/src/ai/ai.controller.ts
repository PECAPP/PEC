import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('completion')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 AI requests per minute
  async getCompletion(@Body() body: any) {
    return this.aiService.getCompletion(body);
  }
}
