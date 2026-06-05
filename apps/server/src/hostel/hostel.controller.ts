import { Controller, Get, Post, Body, Req, Patch, Param, UseGuards } from '@nestjs/common';
import { HostelService } from './hostel.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';

@Controller('hostelIssues')
@UseGuards(AuthGuard, RolesGuard)
export class HostelController {
  constructor(private readonly hostelService: HostelService) {}

  @Roles('student', 'moderator', 'admin', 'college_admin')
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

  @Roles('student')
  @Post()
  async createIssue(@Body() data: any, @Req() req: any) {
    const userId = req.user.id || req.user.sub || req.user.userId;
    const res = await this.hostelService.create({ ...data, studentId: userId });
    return ok(res);
  }

  @Roles('moderator', 'admin', 'college_admin')
  @Patch(':id')
  async updateIssue(@Param('id') id: string, @Body() data: any) {
    const res = await this.hostelService.update(id, data);
    return ok(res);
  }
}
