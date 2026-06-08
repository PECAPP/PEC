import {
  BadRequestException,
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
  StreamableFile,
  UploadedFile,
  UseGuards,
  Res,
  UseInterceptors,
  Header,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AttendanceService } from './attendance.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateWaiverRequestDto } from './dto/create-waiver-request.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { attendanceSchema } from '@pec/shared';
import { ok } from '../common/utils/api-response';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';




@UseGuards(AuthGuard, PoliciesGuard)
@Controller('attendance')
export class AttendanceController {
  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('faculty-stats')
  async getFacultyStats(@Request() req: any) {
    const data = await this.attendanceService.getFacultyStats(req.user.sub);
    return ok(data);
  }

  constructor(private readonly attendanceService: AttendanceService) {}

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('summary')
  async getSummary(@Request() req: any, @Query('studentId') studentId?: string) {
    const targetId = req.user?.role === 'student' ? req.user.sub : studentId;
    if (!targetId) throw new BadRequestException('Student ID is required');
    const data = await this.attendanceService.getStudentSummary(targetId);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('waivers/my')
  async getMyWaiverRequests(@Request() req: any) {
    const data = await this.attendanceService.getWaiverRequestsForStudent(req.user.sub);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'Attendance'))
  @Post('waivers')
  @Throttle({ short: { limit: 10, ttl: 60000 } })
  async createWaiverRequest(
    @Request() req: any,
    @Body() body: CreateWaiverRequestDto,
  ) {
    const data = await this.attendanceService.createWaiverRequest(req.user.sub, body);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'Attendance'))
  @Post('waivers/upload')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadWaiverDocument(
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const data = await this.attendanceService.uploadWaiverDocument(file, req.user.sub);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('waivers/files/:fileName')
  async streamWaiverDocument(
    @Param('fileName') fileName: string,
    @Request() req: any,
    @Res({ passthrough: true }) res: FastifyReply,
  ) {
    const { url } = await this.attendanceService.getWaiverDocument(
      fileName,
      req.user,
    );

    return res.redirect(302, url);
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('export/:courseId')
  async exportExcel(
    @Param('courseId') courseId: string,
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename=attendance_${courseId}.xlsx`);
    await this.attendanceService.generateExcel(courseId, res.raw);
    res.raw.end();
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('my/export')
  async exportMyExcel(
    @Request() req: any,
    @Res() res: FastifyReply
  ) {
    res.header('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.header('Content-Disposition', `attachment; filename=my_attendance.xlsx`);
    await this.attendanceService.generateStudentExcel(req.user.sub, res.raw);
    res.raw.end();
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get('predict')
  @Throttle({ short: { limit: 20, ttl: 60000 } })
  async getPrediction(@Request() req: any, @Query('studentId') studentId?: string, @Query('target') target?: string) {
    const targetId = req.user?.role === 'student' ? req.user.sub : studentId;
    if (!targetId) throw new BadRequestException('Student ID is required');
    const targetPercentage = target ? parseInt(target) : 75;
    const data = await this.attendanceService.getPrediction(targetId, targetPercentage);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('create', 'Attendance'))
  @Post()
  async create(
    @Body(new ZodValidationPipe(attendanceSchema))
    createAttendanceDto: CreateAttendanceDto,
  ) {
    const data = await this.attendanceService.create(createAttendanceDto);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
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

  @CheckPolicies((ability) => ability.can('read', 'Attendance'))
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.attendanceService.findOne(id);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('update', 'Attendance'))
  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body(new ZodValidationPipe(attendanceSchema.partial()))
    updateAttendanceDto: UpdateAttendanceDto,
  ) {
    const data = await this.attendanceService.update(id, updateAttendanceDto);
    return ok(data);
  }

  @CheckPolicies((ability) => ability.can('delete', 'Attendance'))
  @Delete(':id')
  async remove(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const data = await this.attendanceService.remove(id);
    return ok(data);
  }
}

