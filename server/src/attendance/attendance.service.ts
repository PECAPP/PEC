import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import * as xlsx from 'xlsx';

@Injectable()
export class AttendanceService {
  constructor(private readonly repo: AttendanceRepository) {}

  private readonly PEC_COORDINATES = { lat: 30.7673, lng: 76.7863 };
  private readonly MAX_DISTANCE_METERS = 100;

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
