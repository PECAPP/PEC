import { Module } from '@nestjs/common';
import { NoticeboardController } from './noticeboard.controller';
import { NoticeboardService } from './noticeboard.service';

@Module({
  controllers: [NoticeboardController],
  providers: [NoticeboardService],
})
export class NoticeboardModule {}
