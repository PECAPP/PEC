import { Injectable, NotFoundException } from '@nestjs/common';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { CreateAttendanceSessionDto } from './dto/create-attendance-session.dto';
import { UpdateAttendanceSessionDto } from './dto/update-attendance-session.dto';

@Injectable()
export class AttendanceSessionService {
  constructor(private readonly repo: AttendanceSessionRepository) {}

  async create(data: CreateAttendanceSessionDto) {
    // Standard NestJS service logic
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

  async update(id: string, data: UpdateAttendanceSessionDto) {
    return this.repo.update(id, data as any);
  }

  async remove(id: string) {
    return this.repo.remove(id);
  }
}
