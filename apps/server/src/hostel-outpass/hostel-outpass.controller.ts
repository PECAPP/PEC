import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  ForbiddenException,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { HostelOutpassService } from './hostel-outpass.service';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { hostelOutpassSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('hostelOutpass')
export class HostelOutpassController {
  constructor(private readonly service: HostelOutpassService) {}

  @CheckPolicies((ability) => ability.can('read', 'HostelIssue')) // Reusing HostelIssue permission for now
  @Get()
  async findMany(@Query() query: any, @Request() req: any) {
    if (req.user.role === 'student') {
      query.studentId = req.user.uid;
    }
    const result = await this.service.findMany(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @CheckPolicies((ability) => ability.can('read', 'HostelIssue'))
  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const data = await this.service.findById(id);
    if (req.user.role === 'student' && data.studentId !== req.user.uid) {
      throw new ForbiddenException('You can only view your own outpasses.');
    }
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'HostelIssue'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(hostelOutpassSchema))
    body: any,
    @Request() req: any
  ) {
    if (req.user.role === 'student') {
      body.studentId = req.user.uid;
      body.studentName = req.user.name;
    }
    const data = await this.service.create(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('manage', 'HostelIssue'))
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string },
    @Request() req: any
  ) {
    const data = await this.service.updateStatus(id, body.status, req.user.uid);
    return ok(data);
  }
}
