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
  Request,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { BadRequestException } from '@nestjs/common';

@UseGuards(AuthGuard, RolesGuard)
@Controller('attendance')
export class AttendanceController {
  @Roles('faculty', 'college_admin')
  @Get('faculty-stats')
  async getFacultyStats(@Request() req: any) {
    const data = await this.attendanceService.getFacultyStats(req.user.sub);
    return ok(data);
  }

  constructor(private readonly attendanceService: AttendanceService) {}

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('summary')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async getSummary(@Request() req: any, @Query('studentId') studentId?: string) {
    const targetId = req.user?.role === 'student' ? req.user.sub : studentId;
    if (!targetId) throw new BadRequestException('Student ID is required');
    const data = await this.attendanceService.getStudentSummary(targetId);
    return ok(data);
  }

  @Roles('student', 'faculty', 'college_admin', 'admin')
  @Get('predict')
  @Throttle({ short: { limit: 5, ttl: 60000 } })
  async getPrediction(@Request() req: any, @Query('studentId') studentId?: string, @Query('target') target?: string) {
    const targetId = req.user?.role === 'student' ? req.user.sub : studentId;
    if (!targetId) throw new BadRequestException('Student ID is required');
    const targetPercentage = target ? parseInt(target) : 75;
    const data = await this.attendanceService.getPrediction(targetId, targetPercentage);
    return ok(data);
  }

  @Roles('faculty', 'college_admin', 'admin')
  @Post()
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    const data = await this.attendanceService.create(createAttendanceDto);
    return ok(data);
  }

  @Roles('student', 'faculty', 'admin')
  @Get()
  async findAll(@Request() req: any, @Query() query: AttendanceQueryDto) {
    const effectiveQuery = { ...query };
    if (req.user?.role === 'student') {
      effectiveQuery.studentId = req.user.sub;
    }

    const result = await this.attendanceService.findAll(effectiveQuery);
    return ok(result.items, {
      total: result.total,
      limit: result.limit,
      offset: result.offset,
    });
  }

  @Roles('faculty', 'admin')
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.attendanceService.findOne(id);
    return ok(data);
  }

  @Roles('faculty', 'admin')
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const data = await this.attendanceService.update(id, updateAttendanceDto);
    return ok(data);
  }

  @Roles('faculty', 'admin')
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.attendanceService.remove(id);
    return ok(data);
  }
}
