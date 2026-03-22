import { Module } from '@nestjs/common';
import { FeeRecordsController } from './fee-records.controller';
import { FeeRecordsService } from './fee-records.service';
import { FeeRecordsRepository } from './fee-records.repository';

@Module({
  controllers: [FeeRecordsController],
  providers: [FeeRecordsService, FeeRecordsRepository],
})
export class FeeRecordsModule {}
