import { Controller, Get, Post, Body, Req, Patch, Param, UseGuards } from '@nestjs/common';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { HostelService } from './hostel.service';
import { AuthGuard } from '../auth/auth.guard';


import { ok } from '../common/utils/api-response';

@Controller('hostelIssues')
@UseGuards(AuthGuard, PoliciesGuard)
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @CheckPolicies((ability) => ability.can('read', 'HostelIssue'))
  @Get()
  async getIssues(@Req() req: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    const role = req.user.role;
    
    // Moderators/Admins see all, students see only theirs
    const data = (role === 'student') 
      ? await this.hostelService.findAllForStudent(userId)
      : await this.hostelService.findAll();
      
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'HostelIssue'))
  @Post()
  async createIssue(@Body() data: any, @Req() req: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    const res = await this.hostelService.create({ ...data, studentId: userId });
    return ok(res);
  }

  @CheckPolicies((ability) => ability.can('update', 'HostelIssue'))
  @Patch(':id')
  async updateIssue(@Param('id') id: string, @Body() data: any) {
    const res = await this.hostelService.update(id, data);
    return ok(res);
  }
}
