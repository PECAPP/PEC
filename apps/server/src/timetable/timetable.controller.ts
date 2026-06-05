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
} from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { timetableSchema } from '@shared/schemas/erp';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RateLimit } from '../common/decorators/rate-limit-options.decorator';

@UseGuards(AuthGuard, RolesGuard)
@RateLimit({ limit: 2000, windowMs: 60_000, banAfterExceeded: 5 })
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get()
  async findAll(@Query() query: TimetableQueryDto) {
    const result = await this.timetableService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(timetableSchema))
    body: CreateTimetableDto,
  ) {
    const data = await this.timetableService.create(body);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(timetableSchema.partial()))
    body: UpdateTimetableDto,
  ) {
    const data = await this.timetableService.update(id, body);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.timetableService.remove(id);
    return ok(data);
  }
}
