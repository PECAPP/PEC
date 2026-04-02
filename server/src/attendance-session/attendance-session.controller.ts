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
} from '@nestjs/common';
import { AttendanceSessionService } from './attendance-session.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { attendanceSessionSchema } from '@shared/schemas/erp';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, RolesGuard)
@Controller('attendanceSessions')
export class AttendanceSessionController {
  constructor(private readonly service: AttendanceSessionService) {}

  @Roles('faculty', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(attendanceSessionSchema as any))
    data: any,
  ) {
    const result = await this.service.create(data);
    return ok(result);
  }

  @Roles('student', 'faculty', 'admin')
  @Get()
  async findAll(@Query() query: any) {
    const result = await this.service.findAll(query);
    return ok(result);
  }

  @Roles('student', 'faculty', 'admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const result = await this.service.findOne(id);
    return ok(result);
  }

  @Roles('faculty', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(attendanceSessionSchema.partial() as any))
    data: any,
  ) {
    const result = await this.service.update(id, data);
    return ok(result);
  }

  @Roles('faculty', 'admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.service.remove(id);
    return ok(result);
  }
}
