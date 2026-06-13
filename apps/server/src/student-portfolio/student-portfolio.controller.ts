import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { StudentPortfolioService } from './student-portfolio.service';

@UseGuards(AuthGuard)
@Controller('student-portfolio')
export class StudentPortfolioController {
  constructor(private readonly service: StudentPortfolioService) {}

  @Get()
  getPortfolio(@Query('studentId') studentId: string, @Request() req: any) {
    const id = studentId || req.user?.sub;
    return this.service.getPortfolio(id);
  }

  @Patch(':id')
  updatePortfolio(
    @Param('id') id: string,
    @Body() body: any,
  ) {
    return this.service.updateProfile(id, body);
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

