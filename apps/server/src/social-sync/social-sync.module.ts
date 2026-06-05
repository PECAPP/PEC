import { Module } from '@nestjs/common';
import { SocialSyncController } from './social-sync.controller';
import { SocialSyncService } from './social-sync.service';

@Module({
  controllers: [SocialSyncController],
  providers: [SocialSyncService],
})
export class SocialSyncModule {}
