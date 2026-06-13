import { Controller, Post, Body, Get, Query, Param, UseGuards, Patch, Request } from '@nestjs/common';
import { GradingService } from './grading.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';


@UseGuards(AuthGuard)
@Controller('grading')
export class GradingController {
  constructor(private readonly gradingService: GradingService) {}

  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post('score')
  async submitScore(
    @Request() req: any,
    @Body() body: {
      studentId: string;
      courseName: string;
      courseCode?: string;
      term?: string;
      semester: number;
      credits: number;
      maxMarks?: number;
      score: number;
      examDate?: string;
      notes?: string;
    }
  ) {
    return this.gradingService.submitScore(body, req.user);
  }


  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch('score/:id')
  async updateScore(
    @Request() req: any,
    @Param('id') id: string,
    @Body() body: { score: number; maxMarks?: number }
  ) {
    return this.gradingService.updateScore(id, body, req.user);
  }


  @Get('sgpa')
  async getSGPA(
    @Query('studentId') studentId: string,
    @Query('semester') semester: string
  ) {
    const sgpa = await this.gradingService.calculateSGPA(studentId, parseInt(semester, 10));
    return { studentId, semester, sgpa };
  }

  @Get('cgpa')
  async getCGPA(
    @Query('studentId') studentId: string
  ) {
    const cgpa = await this.gradingService.calculateCGPA(studentId);
    return { studentId, cgpa };
  }
}
