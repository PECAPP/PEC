import { Injectable } from '@nestjs/common';
import { AnalyticsRepository } from './analytics.repository';

@Injectable()
export class AnalyticsService {
  constructor(private readonly analyticsRepository: AnalyticsRepository) {}

  async getDashboardStats() {
    return this.analyticsRepository.getDashboardStats();
  }

  async getRecentAdmissions() {
    const rawAdmissions = await this.analyticsRepository.getRecentAdmissions();
    return rawAdmissions.map(user => ({
      id: user.id,
      fullName: user.name,
      department: user.studentProfile?.department || null,
      createdAt: user.createdAt,
      status: 'active'
    }));
  }

  async getDepartmentOverview() {
    return this.analyticsRepository.getDepartmentOverview();
  }

  async getFinanceCharts() {
    // Basic mocked finance for now until actual payment gateway integration
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    return {
      revenue: months.map(m => ({
        name: m,
        total: Math.floor(Math.random() * 5000) + 1000
      })),
      collectionRate: 85.5
    };
  }
}
