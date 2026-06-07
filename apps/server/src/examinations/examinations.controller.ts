import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ExaminationsService } from './examinations.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';



import { ok } from '../common/utils/api-response';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { ExamQueryDto } from './dto/exam-query.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { examinationSchema } from '@pec/shared';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('examinations')
export class ExaminationsController {
  constructor(private readonly service: ExaminationsService) {}

  @CheckPolicies((ability) => ability.can('create', 'Examination'))
  @Post('schedules')
  async createSchedule(
    @Body(new ZodValidationPipe(examinationSchema))
    body: CreateExamScheduleDto,
  ) {
    const data = await this.service.createSchedule(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'Examination'))
  @Get('schedules')
  async listSchedules(@Request() req: any, @Query() query: ExamQueryDto) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];
    const result = await this.service.listSchedules(query, {
      userId: req.user?.sub,
      roles: userRoles,
    });
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('delete', 'Examination'))
  @Delete('schedules/:id')
  async deleteSchedule(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.service.deleteSchedule(id);
    return ok(data);
  }
}

