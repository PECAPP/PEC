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
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { HostelIssuesService } from './hostel-issues.service';
import { HostelIssueQueryDto } from './dto/hostel-issue-query.dto';
import { CreateHostelIssueDto } from './dto/create-hostel-issue.dto';
import { UpdateHostelIssueDto } from './dto/update-hostel-issue.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { hostelIssueSchema } from '@shared/schemas/erp';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, RolesGuard)
@Controller('hostelIssues')
export class HostelIssuesController {
  constructor(private readonly service: HostelIssuesService) {}

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Get()
  async findMany(@Query() query: HostelIssueQueryDto) {
    const result = await this.service.findMany(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Post()
  async create(
    @Body(new ZodValidationPipe(hostelIssueSchema))
    body: CreateHostelIssueDto,
  ) {
    const data = await this.service.create(body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(hostelIssueSchema.partial()))
    body: UpdateHostelIssueDto,
  ) {
    const data = await this.service.update(id, body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin', 'moderator', 'college_admin')
  @Post(':id/replies')
  async reply(
    @Param('id') id: string,
    @Body() body: { text: string; authorName?: string; authorRole?: string },
  ) {
    const data = await this.service.update(id, {
      responses: {
        _op: 'arrayUnion',
        val: {
          text: body.text,
          authorName: body.authorName || 'Staff',
          authorRole: body.authorRole || 'Admin',
          createdAt: new Date().toISOString(),
        },
      },
    } as any);
    return ok(data);
  }

  @Roles('admin', 'moderator', 'college_admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.delete(id);
    return ok(data);
  }
}
