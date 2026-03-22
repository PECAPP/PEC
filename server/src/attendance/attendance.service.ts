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

  update(id: string, data: UpdateAttendanceDto) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
