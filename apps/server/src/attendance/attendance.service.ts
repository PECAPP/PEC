import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { QueueService } from '../background-jobs/queue.service';
import { MessagingService } from '../messaging/messaging.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateWaiverRequestDto } from './dto/create-waiver-request.dto';
import * as ExcelJS from 'exceljs';
import { createReadStream } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';

import { ClamavService } from '../common/services/clamav.service';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class AttendanceService {
  constructor(
    private readonly repo: AttendanceRepository,
    private readonly queue: QueueService,
    private readonly messaging: MessagingService,
    private readonly clamav: ClamavService,
    private readonly s3: S3Service,
  ) {}

  private readonly PEC_COORDINATES = { lat: 30.7673, lng: 76.7863 };
  private readonly MAX_DISTANCE_METERS = 100;
  private readonly WAIVER_UPLOAD_DIR = resolve(process.cwd(), 'uploads', 'waivers');

  async create(data: CreateAttendanceDto) {
    if (data.lat !== undefined && data.lng !== undefined) {
      const lat = Number(data.lat);
      const lng = Number(data.lng);

      if (isNaN(lat) || isNaN(lng)) {
        throw new BadRequestException('Invalid coordinates provided.');
      }

      const distance = this.calculateDistance(
        lat,
        lng,
        this.PEC_COORDINATES.lat,
        this.PEC_COORDINATES.lng
      );
      
      if (isNaN(distance) || distance > this.MAX_DISTANCE_METERS) {
        throw new BadRequestException(`Location mismatch: You must be on PEC Campus to mark attendance (Current distance: ${isNaN(distance) ? 'unknown' : Math.round(distance)}m)`);
      }
    }
    
    const created = await this.repo.create(data);

    // enqueue a background job for async processing (notifications, analytics, etc.)
    // Fire and forget so we don't block the main flow if RabbitMQ is slow
    this.queue.addJob('attendance-created', {
      attendanceId: created.id,
      studentId: created.studentId,
      courseId: created.courseId,
      date: created.date,
      status: created.status,
    }).catch(e => {
      // In a real production app we'd fall back to an outbox pattern (saving event to DB table)
      console.error('Failed to enqueue attendance-created job', e?.message || e);
    });

    // Also publish via RabbitMQ for other services (Fire and forget)
    this.messaging.emitAttendanceCreated({
      attendanceId: created.id,
      studentId: created.studentId,
      courseId: created.courseId,
      date: created.date,
      status: created.status,
    }).catch(e => {
      console.error('Failed to publish attendance.created event', e?.message || e);
    });

    return created;
  }

  async createWaiverRequest(studentId: string, body: CreateWaiverRequestDto) {
    const fromDate = new Date(body.fromDate);
    const toDate = new Date(body.toDate);

    if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
      throw new BadRequestException('Invalid waiver date range');
    }

    if (toDate.getTime() < fromDate.getTime()) {
      throw new BadRequestException('To date cannot be before from date');
    }

    const reason = body.reason?.trim();
    if (!reason || reason.length < 10) {
      throw new BadRequestException('Please provide a detailed reason (minimum 10 characters)');
    }

    return this.repo.createWaiverRequest({
      studentId,
      courseId: body.courseId,
      courseCode: body.courseCode,
      courseName: body.courseName,
      fromDate: body.fromDate,
      toDate: body.toDate,
      reason,
      supportingDocUrl: body.supportingDocUrl,
    });
  }

  getWaiverRequestsForStudent(studentId: string) {
    return this.repo.getWaiverRequestsForStudent(studentId);
  }

  async uploadWaiverDocument(file: any, studentId: string) {
    const maxBytes = 5 * 1024 * 1024;
    if (!file.buffer || file.size <= 0) {
      throw new BadRequestException('Uploaded file is empty');
    }

    if (file.size > maxBytes) {
      throw new BadRequestException('File size exceeds 5 MB limit');
    }

    const allowedMimeTypes = new Set([
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/webp',
    ]);

    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG, PNG and WEBP files are allowed');
    }

    // Magic number validation to prevent spoofing
    const header = file.buffer.subarray(0, 4).toString('hex').toUpperCase();
    let isValidMagic = false;
    
    if (file.mimetype === 'application/pdf' && header === '25504446') isValidMagic = true;
    else if (file.mimetype === 'image/jpeg' && header.startsWith('FFD8FF')) isValidMagic = true;
    else if (file.mimetype === 'image/png' && header === '89504E47') isValidMagic = true;
    else if (file.mimetype === 'image/webp' && header === '52494646') {
      const webpHeader = file.buffer.subarray(8, 12).toString('utf8');
      if (webpHeader === 'WEBP') isValidMagic = true;
    }

    if (!isValidMagic) {
      throw new BadRequestException('Invalid file content signature. File appears to be spoofed.');
    }

    await this.clamav.scanBuffer(file.buffer, file.originalname);

    const key = await this.s3.uploadFile(file.buffer, file.originalname, file.mimetype);

    return {
      fileName: key,
      url: `/api/attendance/waivers/files/${key}`,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    };
  }

  async getWaiverDocument(fileName: string, user: { sub: string; role?: string; roles?: string[] }) {
    if (!fileName || fileName.includes('/') || fileName.includes('\\')) {
      throw new BadRequestException('Invalid file name');
    }

    const roles = new Set([...(user.roles ?? []), user.role].filter(Boolean));
    const isPrivileged = roles.has('college_admin') || roles.has('admin');
    if (!isPrivileged && !fileName.startsWith(`${user.sub}_`)) {
      throw new ForbiddenException('You are not allowed to access this document');
    }

    const url = await this.s3.getSignedDownloadUrl(fileName);
    return { url };
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371e3; // Earth radius in meters
    const phi1 = lat1 * Math.PI / 180;
    const phi2 = lat2 * Math.PI / 180;
    const dPhi = (lat2 - lat1) * Math.PI / 180;
    const dLambda = (lon2 - lon1) * Math.PI / 180;

    const a = Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
              Math.cos(phi1) * Math.cos(phi2) *
              Math.sin(dLambda / 2) * Math.sin(dLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  findAll(query: AttendanceQueryDto) {
    return this.repo.findMany(query);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  getStudentSummary(studentId: string) {
    return this.repo.getStudentSummary(studentId);
  }

  update(id: string, data: UpdateAttendanceDto) {
    return this.repo.update(id, data);
  }

  async getFacultyStats(facultyId: string) {
    const summary = await this.repo.getFacultyStats(facultyId);
    return summary;
  }

  async getPrediction(studentId: string, target = 75) {
    const summary = await this.repo.getStudentSummary(studentId);
    const targetRatio = target / 100;

    return summary.courses.map(course => {
      const { present, total, percentage, late } = course;
      const effectivePresent = present + (late * 0.5);
      
      let status = '';
      let needed = 0;
      let canSkip = 0;

      if (percentage < target) {
        // (effectivePresent + x) / (total + x) >= targetRatio
        needed = Math.ceil((targetRatio * total - effectivePresent) / (1 - targetRatio));
        status = needed > 0 ? `Bunking ${needed} more classes will FAIL you. Attend ${needed} more.` : 'Borderline';
      } else {
        // effectivePresent / (total + x) >= targetRatio
        canSkip = Math.floor((effectivePresent / targetRatio) - total);
        status = canSkip > 0 ? `Safe to skip ${canSkip} classes.` : 'Maintenance mode.';
      }

      return {
        ...course,
        target,
        needed: Math.max(0, needed),
        canSkip: Math.max(0, canSkip),
        status,
        recommendation: percentage < target ? `Attend next ${needed} classes.` : `You can skip up to ${canSkip} classes.`
      };
    });
  }

  remove(id: string) {
    return this.repo.remove(id);
  }

  async generateExcel(courseId: string, stream: any) {
    const data = await this.repo.findMany({ courseId, limit: 1000 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Attendance');
    
    worksheet.columns = [
      { header: 'Student ID', key: 'studentId' },
      { header: 'Subject', key: 'subject' },
      { header: 'Date', key: 'date' },
      { header: 'Status', key: 'status' },
      { header: 'CreatedAt', key: 'createdAt' },
    ];

    data.items.forEach((item: any) => {
      worksheet.addRow({
        studentId: item.studentId,
        subject: item.subject,
        date: item.date.toISOString().split('T')[0],
        status: item.status.toUpperCase(),
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : 'N/A'
      });
    });

    await workbook.xlsx.write(stream);
  }

  async generateStudentExcel(studentId: string, stream: any) {
    const data = await this.repo.findMany({ studentId, limit: 1000 });
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('My Attendance');
    
    worksheet.columns = [
      { header: 'Subject', key: 'subject' },
      { header: 'Date', key: 'date' },
      { header: 'Status', key: 'status' },
      { header: 'CreatedAt', key: 'createdAt' },
    ];

    data.items.forEach((item: any) => {
      worksheet.addRow({
        subject: item.subject,
        date: item.date.toISOString().split('T')[0],
        status: item.status.toUpperCase(),
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : 'N/A'
      });
    });

    await workbook.xlsx.write(stream);
  }
}
