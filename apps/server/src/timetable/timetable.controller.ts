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
  UseInterceptors,
} from '@nestjs/common';
import { CacheInterceptor, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import { TimetableService } from './timetable.service';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { timetableSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { RateLimit } from '../common/decorators/rate-limit-options.decorator';

@UseGuards(AuthGuard, PoliciesGuard)
@RateLimit({ limit: 2000, windowMs: 60_000, banAfterExceeded: 5 })
@Controller('timetable')
export class TimetableController {
  constructor(private readonly timetableService: TimetableService) {}

  @CheckPolicies((ability) => ability.can('read', 'Timetable'))
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  @Get()
  async findAll(@Query() query: TimetableQueryDto) {
    const result = await this.timetableService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('create', 'Timetable'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(timetableSchema))
    body: CreateTimetableDto,
  ) {
    const data = await this.timetableService.create(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'Timetable'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(timetableSchema.partial()))
    body: UpdateTimetableDto,
  ) {
    const data = await this.timetableService.update(id, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'Timetable'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.timetableService.remove(id);
    return ok(data);
  }
}

