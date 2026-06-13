import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';
import { assertCourseOwnership } from '../common/utils/ownership.utils';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AttendanceSessionService {
  constructor(
    private readonly repo: AttendanceSessionRepository,
    private readonly prisma: PrismaService,
  ) {}

  async create(data: CreateAttendanceSessionDto, user?: any) {
    if (user?.role === 'faculty') {
      await assertCourseOwnership(user.sub, data.courseId, this.prisma);
    }
    return this.repo.create(data as any);
  }

  async findAll(query: any) {
    return this.repo.findAll(query);
  }

  async findOne(id: string) {
    const session = await this.repo.findById(id);
    if (!session) throw new NotFoundException(`Attendance session with ID ${id} not found`);
    return session;
  }

  async findByQrCode(qrCode: string) {
    return this.repo.findByQrCode(qrCode);
  }

  async countBySession(sessionId: string): Promise<number> {
    return this.repo.countBySession(sessionId);
  }

  async update(id: string, data: UpdateAttendanceSessionDto, user?: any) {
    if (user?.role === 'faculty') {
      const session = await this.repo.findById(id);
      if (!session) throw new NotFoundException(`Attendance session with ID ${id} not found`);
      await assertCourseOwnership(user.sub, session.courseId, this.prisma);
      if (data.courseId && data.courseId !== session.courseId) {
        await assertCourseOwnership(user.sub, data.courseId, this.prisma);
      }
    }
    return this.repo.update(id, data as any);
  }

  async remove(id: string, user?: any) {
    if (user?.role === 'faculty') {
      const session = await this.repo.findById(id);
      if (!session) throw new NotFoundException(`Attendance session with ID ${id} not found`);
      await assertCourseOwnership(user.sub, session.courseId, this.prisma);
    }
    return this.repo.remove(id);
  }
}
