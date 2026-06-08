import { Controller, Get, Patch, Delete, Body, Req, UseGuards, Post, UploadedFile, UseInterceptors, InternalServerErrorException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { SettingsService } from './settings.service';
import { AuthGuard } from '../auth/auth.guard';
import { Request } from 'express';
import { ClamavService } from '../common/services/clamav.service';
import { S3Service } from '../common/services/s3.service';
import { QueueService } from '../background-jobs/queue.service';

@Controller('settings')
@UseGuards(AuthGuard)
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly clamavService: ClamavService,
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
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@Req() req: Request, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new InternalServerErrorException('No file uploaded');
    const userId = (req.user as any).id;
    
    // 1. Scan the file with ClamAV
    await this.clamavService.scanBuffer(file.buffer, file.originalname);

    // 2. Upload to MinIO via S3Service
    const fileKey = `avatar_${userId}_${Date.now()}.png`;
    await this.s3Service.uploadFile(file.buffer, fileKey, file.mimetype);

    // 3. Return the URL (in real app, we'd update user profile too)
    const url = `/api/storage/avatars/${fileKey}`;
    return { success: true, url };
  }
}
