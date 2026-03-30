import { Module } from '@nestjs/common';
import { HostelIssuesController } from './hostel-issues.controller';
import { HostelIssuesService } from './hostel-issues.service';
import { HostelIssuesRepository } from './hostel-issues.repository';

@Module({
  controllers: [HostelIssuesController],
  providers: [HostelIssuesService, HostelIssuesRepository],
})
export class HostelIssuesModule {}
