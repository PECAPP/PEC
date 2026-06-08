import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { CalendarSyncController } from './calendar-sync.controller';
import { DataExportConsumer } from './data-export.consumer';
import { CommonServicesModule } from '../common/common.module';
import { QueueModule } from '../background-jobs/queue.module';

@Module({
  imports: [
    CommonServicesModule,
    QueueModule,
  ],
  controllers: [SettingsController, CalendarSyncController, DataExportConsumer],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
