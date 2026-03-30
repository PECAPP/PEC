import { Injectable } from '@nestjs/common';
import { AttendanceRepository } from './attendance.repository';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';

@Injectable()
export class AttendanceService {
  constructor(private readonly repo: AttendanceRepository) {}

  create(data: CreateAttendanceDto) {
    return this.repo.create(data);
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
}
