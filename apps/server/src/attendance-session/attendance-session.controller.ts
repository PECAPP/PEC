import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';

import { AttendanceSessionService } from './attendance-session.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { attendanceSessionSchema } from '@pec/shared';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';



import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('attendanceSessions')
export class AttendanceSessionController {
  constructor(private readonly service: AttendanceSessionService) {}

  @CheckPolicies((ability) => ability.can('create', 'AttendanceSession'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Post()
  async create(
    @Request() req: any,
    @Body(new ZodValidationPipe(attendanceSessionSchema as any))
    data: any,
  ) {
    const result = await this.service.create(data, req.user);
    return ok(result);
  }

  @CheckPolicies((ability) => ability.can('read', 'AttendanceSession'))
  @Get()
  async findAll(@Query() query: any) {
    const result = await this.service.findAll(query);
    return ok(result);
  }

  @CheckPolicies((ability) => ability.can('read', 'AttendanceSession'))
  @Get(':id/count')
  async countAttendance(@Param('id') id: string) {
    const count = await this.service.countBySession(id);
    return ok({ count });
  }

  @CheckPolicies((ability) => ability.can('read', 'AttendanceSession'))
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return ok(result);
  }

  @CheckPolicies((ability) => ability.can('update', 'AttendanceSession'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(attendanceSessionSchema.partial() as any))
    data: any,
  ) {
    const result = await this.service.update(id, data, req.user);
    return ok(result);
  }

  @CheckPolicies((ability) => ability.can('delete', 'AttendanceSession'))
  @UseGuards(RolesGuard)
  @Roles('college_admin', 'faculty')
  @Delete(':id')
  async remove(@Request() req: any, @Param('id') id: string) {
    const result = await this.service.remove(id, req.user);
    return ok(result);
  }
}

