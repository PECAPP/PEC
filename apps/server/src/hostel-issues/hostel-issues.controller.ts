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
  ForbiddenException,
  Request
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { HostelIssuesService } from './hostel-issues.service';
import { HostelIssueQueryDto } from './dto/hostel-issue-query.dto';
import { CreateHostelIssueDto } from './dto/create-hostel-issue.dto';
import { UpdateHostelIssueDto } from './dto/update-hostel-issue.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { hostelIssueSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('hostelIssues')
export class HostelIssuesController {
  constructor(private readonly service: HostelIssuesService) {}

  @CheckPolicies((ability) => ability.can('read', 'HostelIssue'))
  @Get()
  async findMany(@Query() query: HostelIssueQueryDto, @Request() req: any) {
    // If user is a student, force studentId filter for ABAC ownership
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
    
    // Ownership check for ABAC
    if (req.user.role === 'student' && data.studentId !== req.user.uid) {
        throw new ForbiddenException('You can only view your own hostel issues.');
    }

    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'HostelIssue'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(hostelIssueSchema))
    body: CreateHostelIssueDto,
    @Request() req: any
  ) {
    // Enforce ownership on creation
    if (req.user.role === 'student') {
        body.studentId = req.user.uid;
    }
    const data = await this.service.create(body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'HostelIssue'))
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(hostelIssueSchema.partial()))
    body: UpdateHostelIssueDto,
    @Request() req: any
  ) {
    const existing = await this.service.findById(id);
    
    if (req.user.role === 'student' && existing.studentId !== req.user.uid) {
        throw new ForbiddenException('You can only update your own hostel issues.');
    }

    const data = await this.service.update(id, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'HostelIssue'))
  @Post(':id/replies')
  async reply(
    @Param('id') id: string,
    @Body() body: { text: string },
    @Request() req: any
  ) {
    const data = await this.service.update(id, {
      responses: {
        _op: 'arrayUnion',
        val: {
          text: body.text,
          authorName: req.user.name || req.user.email || req.user.uid || req.user.sub || 'Unknown',
          authorRole: req.user.role || 'student',
          createdAt: new Date().toISOString(),
        },
      },
    } as any);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'HostelIssue'))
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.delete(id);
    return ok(data);
  }
}
