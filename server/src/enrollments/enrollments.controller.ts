import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles('student', 'faculty', 'college_admin')
  @Get()
  async findAll(@Request() req: any, @Query() query: EnrollmentQueryDto) {
    const effectiveQuery = { ...query };
    if (req.user?.role === 'student') {
      effectiveQuery.studentId = req.user.sub;
    }

    const result = await this.enrollmentsService.findAll(effectiveQuery);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('faculty', 'college_admin')
  @Post()
  async create(@Body() body: CreateEnrollmentDto) {
    const data = await this.enrollmentsService.create(body);
    return ok(data);
  }

  @Roles('faculty', 'college_admin')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateEnrollmentDto,
  ) {
    const data = await this.enrollmentsService.update(id, body);
    return ok(data);
  }
}
