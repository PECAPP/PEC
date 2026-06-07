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
import { CacheInterceptor, CacheKey } from '@nestjs/cache-manager';

@Controller('admin')
@UseGuards(AuthGuard, PoliciesGuard)
  @CheckPolicies((ability) => ability.can('read', 'Admin'))
export class AdminController {
  @Get('dashboard-stats')
  @UseInterceptors(CacheInterceptor)
  @CacheKey('dashboard-stats-cache')
  async getStats() {
    const data = await this.adminService.getDashboardStats();
    return ok(data);
  }

  constructor(private readonly adminService: AdminService) {}

  @Post('bulk/users')
  @UseInterceptors(FileInterceptor('file'))
  async bulkUsers(@UploadedFile() file: Express.Multer.File) {
    const results = await this.adminService.processUserBulk(file);
    return ok(results);
  }

  @Post('bulk/attendance')
  @UseInterceptors(FileInterceptor('file'))
  async bulkAttendance(@UploadedFile() file: Express.Multer.File) {
    const results = await this.adminService.processAttendanceBulk(file);
    return ok(results);
  }
}

