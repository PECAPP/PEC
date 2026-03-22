import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JobQueryDto } from './dto/job-query.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Roles('faculty', 'college_admin', 'admin', 'moderator')
  @Post()
  async create(@Body() createJobDto: CreateJobDto) {
    const data = await this.jobsService.create(createJobDto);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get()
  async findAll(@Query() query: JobQueryDto) {
    const result = await this.jobsService.findAll(query);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.jobsService.findOne(id);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin', 'moderator')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    const data = await this.jobsService.update(id, updateJobDto);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin', 'moderator')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.jobsService.remove(id);
    return ok(data);
  }
}
