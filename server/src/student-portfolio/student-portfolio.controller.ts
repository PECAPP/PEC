import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StudentPortfolioService } from './student-portfolio.service';
import {
  CreateStudentProjectDto,
  UpdateStudentProjectDto,
  CreateStudentSkillDto,
  UpdateStudentSkillDto,
} from './dto/student-portfolio.dto';

@UseGuards(AuthGuard)
@Controller('student-portfolio')
export class StudentPortfolioController {
  constructor(private readonly service: StudentPortfolioService) {}

  @Get()
  getPortfolio(@Query('studentId') studentId: string, @Request() req: any) {
    const id = studentId || req.user?.sub;
    return this.service.getPortfolio(id);
  }

  @Get('projects')
  getProjects(@Query('studentId') studentId: string, @Request() req: any) {
    const id = studentId || req.user?.sub;
    return this.service.getProjects(id);
  }

  @Post('projects')
  createProject(@Body() body: CreateStudentProjectDto) {
    return this.service.createProject(body);
  }

  @Patch('projects/:id')
  updateProject(@Param('id') id: string, @Body() body: UpdateStudentProjectDto) {
    return this.service.updateProject(id, body);
  }

  @Delete('projects/:id')
  deleteProject(@Param('id') id: string) {
    return this.service.deleteProject(id);
  }

  @Get('skills')
  getSkills(@Query('studentId') studentId: string, @Request() req: any) {
    const id = studentId || req.user?.sub;
    return this.service.getSkills(id);
  }

  @Post('skills')
  createSkill(@Body() body: CreateStudentSkillDto) {
    return this.service.createSkill(body);
  }

  @Patch('skills/:id')
  updateSkill(@Param('id') id: string, @Body() body: UpdateStudentSkillDto) {
    return this.service.updateSkill(id, body);
  }

  @Delete('skills/:id')
  deleteSkill(@Param('id') id: string) {
    return this.service.deleteSkill(id);
  }

  @Get('github/sync')
  syncGitHubRepos(
    @Query('studentId') studentId: string,
    @Query('username') username: string,
    @Request() req: any,
  ) {
    const id = studentId || req.user?.sub;
    return this.service.syncGitHubRepos(id, username);
  }
}
