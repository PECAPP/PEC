import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadStudents(@UploadedFile() file: Express.Multer.File) {
    const results = await this.adminService.processUserBulk(file);
    return ok(results);
  }

  @Post('upload-timetable')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadTimetable(@UploadedFile() file: Express.Multer.File) {
    const results = await this.adminService.processAttendanceBulk(file);
    return ok(results);
  }
}
