import { Controller, Get, Patch, Delete, Body, Req, UseGuards, Post, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { S3Service } from '../common/services/s3.service';
import { QueueService } from '../background-jobs/queue.service';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly s3Service: S3Service,
    private readonly queueService: QueueService
  ) {}

  @Get()
  async getSettings(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.settingsService.getSettings(userId);
  }

  @Patch()
  async updateSettings(@Req() req: Request, @Body() data: any) {
    const userId = (req.user as any).id;
    return this.settingsService.updateSettings(userId, data);
  }

  @Get('sessions')
  async getSessions(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.settingsService.getActiveSessions(userId);
  }

  @Delete('sessions/revoke-all')
  async revokeAllSessions(@Req() req: Request) {
    const userId = (req.user as any).id;
    // req.user might have the current token hash if passed in strategy
    return this.settingsService.revokeAllSessions(userId);
  }

  @Get('oauth')
  async getOAuthAccounts(@Req() req: Request) {
    const userId = (req.user as any).id;
    return this.settingsService.getOAuthAccounts(userId);
  }

  @Post('data-export')
  async requestDataExport(@Req() req: Request) {
    const userId = (req.user as any).id;
    await this.queueService.addJob('data-export', { userId, format: 'json' });
    return { success: true, message: 'Data export job queued.' };
  }

  @Post('avatar')
  async uploadAvatar(@Req() req: Request, @Body() body: { fileKey: string }) {
    if (!body.fileKey) throw new BadRequestException('No fileKey provided');
    const userId = (req.user as any).id;
    
    // In a real app, verify the file exists in S3 and update the user's avatar URL
    // await this.settingsService.updateAvatar(userId, body.fileKey);

    const url = `/api/storage/avatars/${body.fileKey}`;
    return { success: true, url };
  }
}
