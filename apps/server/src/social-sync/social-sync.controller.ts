import {
  Body,
  Controller,
  Get,
  Patch,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SocialSyncService } from './social-sync.service';
import { SyncSocialDto } from './dto/sync-social.dto';

@UseGuards(AuthGuard)
@Controller('social-sync')
export class SocialSyncController {
  constructor(private readonly service: SocialSyncService) {}

  @Get()
  getSocialData(@Request() req: any) {
    return this.service.getSocialData(req.user?.sub);
  }

  @Get('github/repos')
  fetchGitHubRepos(@Request() req: any) {
    return this.service.fetchGitHubRepos(req.user?.sub);
  }

  @Patch()
  syncSocialData(@Request() req: any, @Body() body: SyncSocialDto) {
    return this.service.syncSocialData(req.user?.sub, body);
  }
}
