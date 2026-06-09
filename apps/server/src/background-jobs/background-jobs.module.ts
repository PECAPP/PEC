import { Module } from '@nestjs/common';
import { BackgroundJobsController } from './background-jobs.controller';
import { BackgroundJobsService } from './background-jobs.service';
import { QueueModule } from './queue.module';

@Module({
  imports: [QueueModule],
  controllers: [BackgroundJobsController],
  providers: [BackgroundJobsService],
  exports: [BackgroundJobsService, QueueModule],
})
export class BackgroundJobsModule {}
