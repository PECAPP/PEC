import { Controller, Post, Body, UseGuards, Req, Res } from '@nestjs/common';
import { Response } from 'express';
import { AiService } from './ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('ai')
@UseGuards(AuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('completion')
  @Throttle({ short: { limit: 10, ttl: 60000 } }) // 10 AI requests per minute
  async getCompletion(@Body() body: any, @Req() req: any, @Res() res: Response) {
    // AuthGuard spreads the JWT payload → user ID is at req.user.sub (JWT standard)
    const userId = req.user?.sub || req.user?.id || req.user?.uid;
    
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    await this.aiService.getCompletion(body, res, userId);
  }
}
