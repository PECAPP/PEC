import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

import { ok } from '../common/utils/api-response';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';

@Controller('admin')
@UseGuards(AuthGuard, PoliciesGuard)
@CheckPolicies((ability) => ability.can('read', 'Admin'))
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard-stats')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-stats-cache')
  @CacheTTL(60000)
  async getStats() {
    const data = await this.adminService.getDashboardStats();
    return ok(data);
  }

  @Post('upload-students')
  async uploadStudents(@Body() body: { fileKey: string }) {
    const results = await this.adminService.processUserBulk(body.fileKey);
    return ok(results);
  }

  @Post('upload-timetable')
  async uploadTimetable(@Body() body: { fileKey: string }) {
    const results = await this.adminService.processAttendanceBulk(body.fileKey);
    return ok(results);
  }
}
