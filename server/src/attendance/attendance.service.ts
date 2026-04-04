import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { CreateWaiverRequestDto } from './dto/create-waiver-request.dto';
import * as xlsx from 'xlsx';
import { createReadStream } from 'fs';
import { mkdir, stat, writeFile } from 'fs/promises';
import { extname, join, resolve } from 'path';
import { randomUUID } from 'crypto';

@Injectable()
export class AttendanceService {
  constructor(private readonly repo: AttendanceRepository) {}

  private readonly PEC_COORDINATES = { lat: 30.7673, lng: 76.7863 };
  private readonly MAX_DISTANCE_METERS = 100;
  private readonly WAIVER_UPLOAD_DIR = resolve(process.cwd(), 'uploads', 'waivers');

  async create(data: CreateAttendanceDto) {
    if (data.lat && data.lng) {
      const distance = this.calculateDistance(
        data.lat,
        data.lng,
        this.PEC_COORDINATES.lat,
        this.PEC_COORDINATES.lng
      );
      
      if (distance > this.MAX_DISTANCE_METERS) {
        throw new Error(`Location mismatch: You must be on PEC Campus to mark attendance (Current distance: ${Math.round(distance)}m)`);
      }
    }
    
    return this.repo.create(data);
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

  async uploadWaiverDocument(file: Express.Multer.File, studentId: string) {
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

    await mkdir(this.WAIVER_UPLOAD_DIR, { recursive: true });

    const ext = extname(file.originalname || '').toLowerCase();
    const safeExt = ext && ext.length <= 8 ? ext : file.mimetype === 'application/pdf' ? '.pdf' : '.bin';
    const fileName = `${studentId}_${Date.now()}_${randomUUID()}${safeExt}`;
    const filePath = join(this.WAIVER_UPLOAD_DIR, fileName);

    await writeFile(filePath, file.buffer);

    return {
      fileName,
      url: `/api/attendance/waivers/files/${fileName}`,
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

    const filePath = join(this.WAIVER_UPLOAD_DIR, fileName);
    let fileStats;
    try {
      fileStats = await stat(filePath);
    } catch {
      throw new NotFoundException('Document not found');
    }

    if (!fileStats.isFile()) {
      throw new NotFoundException('Document not found');
    }

    const ext = extname(fileName).toLowerCase();
    const mimeType =
      ext === '.pdf'
        ? 'application/pdf'
        : ext === '.jpg' || ext === '.jpeg'
          ? 'image/jpeg'
          : ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : 'application/octet-stream';

    return {
      stream: createReadStream(filePath),
      mimeType,
      contentDisposition: `inline; filename="${fileName}"`,
    };
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

  async generateExcel(courseId: string) {
    const data = await this.repo.findMany({ courseId, limit: 1000 });
    const records = data.items.map((item: any) => ({
      'Student ID': item.studentId,
      'Subject': item.subject,
      'Date': item.date.toISOString().split('T')[0],
      'Status': item.status.toUpperCase(),
      'CreatedAt': item.createdAt ? new Date(item.createdAt).toISOString() : 'N/A'
    }));

    const worksheet = xlsx.utils.json_to_sheet(records);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'Attendance');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }

  async generateStudentExcel(studentId: string) {
    const data = await this.repo.findMany({ studentId, limit: 1000 });
    const records = data.items.map((item: any) => ({
      'Subject': item.subject,
      'Date': item.date.toISOString().split('T')[0],
      'Status': item.status.toUpperCase(),
      'CreatedAt': item.createdAt ? new Date(item.createdAt).toISOString() : 'N/A'
    }));

    const worksheet = xlsx.utils.json_to_sheet(records);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, 'My Attendance');
    
    return xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  }
}
