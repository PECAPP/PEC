import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';



import { ok } from '../common/utils/api-response';
import { CgpaEntriesService } from './cgpa-entries.service';
import { CgpaEntryQueryDto } from './dto/cgpa-entry-query.dto';
import { CreateCgpaEntryDto } from './dto/create-cgpa-entry.dto';
import { UpdateCgpaEntryDto } from './dto/update-cgpa-entry.dto';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('cgpa-entries')
export class CgpaEntriesController {
  @CheckPolicies((ability) => ability.can('read', 'CgpaEntry'))
  @Get('dashboard/summary')
  async getStats(@Request() req: any, @Query('userId') userId?: string) {
    const targetUserId = userId || req.user.sub;
    const data = await this.service.getAcademicStats(targetUserId);
    return ok(data);
  }

  constructor(private readonly service: CgpaEntriesService) {}

  @CheckPolicies((ability) => ability.can('read', 'CgpaEntry'))
  @Get()
  async findMany(@Request() req: any, @Query() query: CgpaEntryQueryDto) {
    const result = await this.service.findMany(req.user.sub, req.user.role, query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'CgpaEntry'))
  @Get(':id')
  async findOne(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.service.findOne(id, req.user.sub, req.user.role);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'CgpaEntry'))
  @Post()
  async create(@Request() req: any, @Body() body: CreateCgpaEntryDto) {
    const data = await this.service.create(req.user.sub, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'CgpaEntry'))
  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateCgpaEntryDto,
  ) {
    const data = await this.service.update(id, req.user.sub, req.user.role, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'CgpaEntry'))
  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.service.remove(id, req.user.sub, req.user.role);
    return ok(data);
  }
}

