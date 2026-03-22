import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class AttendanceRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: AttendanceQueryDto) {
    const where = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.subject ? { subject: query.subject } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.date
        ? {
            date: {
              gte: new Date(query.date),
              lt: new Date(new Date(query.date).getTime() + 86_400_000),
            },
          }
        : {}),
    };

    return this.findManyWithCount(this.prisma.attendance, {
      query,
      defaultLimit: 20,
      where,
      orderBy: { date: 'desc' },
    });
  }

  findById(id: string) {
    return this.prisma.attendance.findUnique({ where: { id } });
  }

  create(data: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  update(id: string, data: UpdateAttendanceDto) {
    return this.prisma.attendance.update({
      where: { id },
      data: {
        ...data,
        ...(data.date ? { date: new Date(data.date) } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.attendance.delete({ where: { id } });
  }
}
