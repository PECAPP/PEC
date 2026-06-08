import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { AuthGuard } from '../auth/auth.guard';


import { ok } from '../common/utils/api-response';
import { BackgroundJobsService } from './background-jobs.service';
import { CreateBackgroundJobDto } from './dto/create-background-job.dto';

@UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can('manage', 'all'))
@Controller('background-jobs')
export class BackgroundJobsController {
  constructor(private readonly backgroundJobsService: BackgroundJobsService) {}

  @Get()
  async list(@Query('limit') limit?: string) {
    const data = await this.backgroundJobsService.list(
      limit ? Number(limit) : 50,
    );
    return ok(data);
  }

  @Post()
  async enqueue(@Body() body: CreateBackgroundJobDto) {
    const data = await this.backgroundJobsService.enqueue(body);
    return ok(data);
  }

  @Post('prune-audit-logs')
  async enqueueAuditLogPrune(@Body('retentionDays') retentionDays?: number) {
    const data = await this.backgroundJobsService.enqueueAuditLogPrune(
      retentionDays ?? 30,
    );
    return ok(data);
  }

  // RabbitMQ Event Handlers
  @EventPattern('send-email')
  async handleSendEmail(data: any) {
    console.log('[RMQ] Sending email job payload:', data);
  }

  @EventPattern('example')
  async handleExampleJob(data: any) {
    console.log('[RMQ] Example job executed', data);
  }

  @EventPattern('attendance-created')
  async handleAttendanceCreated(data: any) {
    console.log(`[RMQ] Processing attendance recalculation for student: ${data.studentId}`);
    console.log(`[RMQ] Cached metrics successfully updated for course: ${data.courseId}`);
  }
}

