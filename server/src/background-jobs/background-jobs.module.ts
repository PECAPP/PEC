import { Module } from '@nestjs/common';
import { BackgroundJobsController } from './background-jobs.controller';
import { BackgroundJobsService } from './background-jobs.service';

@Module({
  controllers: [BackgroundJobsController],
  providers: [BackgroundJobsService],
  exports: [BackgroundJobsService],
})
export class BackgroundJobsModule {}
