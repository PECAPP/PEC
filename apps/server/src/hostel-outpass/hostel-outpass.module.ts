import { Module } from '@nestjs/common';
import { HostelOutpassService } from './hostel-outpass.service';
import { HostelOutpassController } from './hostel-outpass.controller';
import { HostelOutpassRepository } from './hostel-outpass.repository';

@Module({
  controllers: [HostelOutpassController],
  providers: [HostelOutpassService, HostelOutpassRepository],
  exports: [HostelOutpassService],
})
export class HostelOutpassModule {}
