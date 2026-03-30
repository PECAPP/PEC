import {
  ForbiddenException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Delete,
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

interface AuthenticatedRequest {
  user?: {
    sub: string;
    uid?: string;
    role?: string;
  };
}

@UseGuards(AuthGuard, RolesGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Roles('student', 'faculty', 'college_admin')
  @Get()
  async findAll(@Request() req: AuthenticatedRequest, @Query() query: EnrollmentQueryDto) {
    const effectiveQuery = { ...query };
    if (req.user?.role === 'student') {
      effectiveQuery.studentId = req.user.sub || req.user.uid;
    }

    const result = await this.enrollmentsService.findAll(effectiveQuery);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Post()
  async create(@Request() req: AuthenticatedRequest, @Body() body: CreateEnrollmentDto) {
    const payload = { ...body };
    if (req.user?.role === 'student') {
      payload.studentId = req.user.sub;
      payload.status = payload.status ?? 'active';
    }

    const data = await this.enrollmentsService.create(payload);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Patch(':id')
  async update(
    @Request() req: AuthenticatedRequest,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: UpdateEnrollmentDto,
  ) {
    if (req.user?.role === 'student') {
      const existing = await this.enrollmentsService.findById(id);
      if (!existing) {
        throw new NotFoundException('Enrollment not found');
      }

      if (existing.studentId !== req.user.sub) {
        throw new ForbiddenException('You can only modify your own enrollment');
      }
    }

    const data = await this.enrollmentsService.update(id, body);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Delete()
  async remove(
    @Request() req: any, 
    @Query('courseId', new ParseUUIDPipe({ version: '4' })) courseId: string,
    @Query('studentId') studentIdQuery?: string,
  ) {
    const studentId = req.user.role === 'student' ? (req.user.sub || req.user.uid) : studentIdQuery;
    const result = await this.enrollmentsService.remove(studentId, courseId);
    return ok(result);
  }
}
