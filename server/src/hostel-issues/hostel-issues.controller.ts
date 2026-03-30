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
import { ok } from '../common/utils/api-response';
import { HostelIssuesService } from './hostel-issues.service';
import { HostelIssueQueryDto } from './dto/hostel-issue-query.dto';
import { CreateHostelIssueDto } from './dto/create-hostel-issue.dto';
import { UpdateHostelIssueDto } from './dto/update-hostel-issue.dto';

@UseGuards(AuthGuard, RolesGuard)
@Controller('hostelIssues')
export class HostelIssuesController {
  constructor(private readonly service: HostelIssuesService) {}

  @Roles('student', 'faculty', 'admin')
  @Get()
  async findMany(@Query() query: HostelIssueQueryDto) {
    const result = await this.service.findMany(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'admin')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const data = await this.service.findById(id);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin')
  @Post()
  async create(@Body() body: CreateHostelIssueDto) {
    const data = await this.service.create(body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: UpdateHostelIssueDto) {
    const data = await this.service.update(id, body);
    return ok(data);
  }

  @Roles('admin')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const data = await this.service.delete(id);
    return ok(data);
  }
}
