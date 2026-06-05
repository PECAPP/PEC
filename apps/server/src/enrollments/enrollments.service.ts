import { Injectable, BadRequestException } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly repo: EnrollmentsRepository) {}

  findAll(query: EnrollmentQueryDto) {
    return this.repo.findMany(query);
  }

  async create(data: CreateEnrollmentDto) {
    // 1. Check Capacity & Prerequisites
    const blocker = await this.repo.findEnrollmentBlockers(data.studentId, data.courseId);
    if (blocker.blocked) {
      throw new BadRequestException(blocker.reason);
    }

    // 2. Check for schedule conflicts
    const conflicts = await this.repo.findConflicts(data.studentId, data.courseId);
    if (conflicts.length > 0) {
      const details = conflicts.map(c => `${c.day} at ${c.time} with ${c.withCourse}`).join(', ');
      throw new BadRequestException(`Schedule conflict found: ${details}`);
    }

    return this.repo.create(data);
  }

  update(id: string, data: UpdateEnrollmentDto) {
    return this.repo.update(id, data);
  }

  remove(studentId: string, courseId: string) {
    return this.repo.removeByStudentAndCourse(studentId, courseId);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }
}
