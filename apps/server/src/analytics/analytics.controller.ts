import { Controller, Get, UseGuards } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('analytics')
@UseGuards(AuthGuard, RolesGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @Roles('college_admin')
  async getDashboard() {
    const [stats, recentAdmissions, departmentOverview, financeCharts] = await Promise.all([
      this.analyticsService.getDashboardStats(),
      this.analyticsService.getRecentAdmissions(),
      this.analyticsService.getDepartmentOverview(),
      this.analyticsService.getFinanceCharts()
    ]);

    return {
      success: true,
      data: {
        stats,
        recentAdmissions,
        departmentOverview,
        financeCharts
      }
    };
  }
}
