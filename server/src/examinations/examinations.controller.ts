import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ExaminationsService } from './examinations.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { CreateGradeDto } from './dto/create-grade.dto';
import { ExamQueryDto } from './dto/exam-query.dto';
import { GradeQueryDto } from './dto/grade-query.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('examinations')
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Post('schedules')
  async createSchedule(@Body() body: CreateExamScheduleDto) {
    const data = await this.service.createSchedule(body);
    return ok(data);
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty', 'student')
  @Get('schedules')
  async listSchedules(@Query() query: ExamQueryDto) {
    const result = await this.service.listSchedules(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Delete('schedules/:id')
  async deleteSchedule(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.service.deleteSchedule(id);
    return ok(data);
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty')
  @Post('grades')
  async upsertGrade(@Body() body: CreateGradeDto) {
    const data = await this.service.upsertGrade(body);
    return ok(data);
  }

  @Roles('college_admin', 'admin', 'moderator', 'faculty', 'student')
  @Get('grades')
  async listGrades(@Query() query: GradeQueryDto) {
    const result = await this.service.listGrades(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }
}
