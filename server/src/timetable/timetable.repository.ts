import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class TimetableRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: TimetableQueryDto) {
    const where = {
      ...(query.department ? { department: query.department } : {}),
      ...(query.semester ? { semester: query.semester } : {}),
      ...(query.facultyId ? { facultyId: query.facultyId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    return this.findManyWithCount(this.prisma.timetable, {
      query,
      defaultLimit: 500,
      where,
      orderBy: [{ day: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findConflicts(room: string, day: string, startTime: string, endTime: string, excludeId?: string) {
    return this.prisma.timetable.findFirst({
      where: {
        room,
        day,
        id: excludeId ? { not: excludeId } : undefined,
        OR: [
          { startTime: { gte: startTime, lt: endTime } },
          { endTime: { gt: startTime, lte: endTime } },
          { startTime: { lte: startTime }, endTime: { gte: endTime } }
        ]
      }
    });
  }

  create(data: CreateTimetableDto) {
    return this.prisma.timetable.create({
      data: {
        ...data,
        courseId: data.courseId ?? null,
        facultyId: data.facultyId ?? null,
        facultyName: data.facultyName ?? null,
        department: data.department ?? null,
        semester: data.semester ?? null,
        batch: data.batch ?? null,
      },
    });
  }

  update(id: string, data: UpdateTimetableDto) {
    return this.prisma.timetable.update({
      where: { id },
      data: {
        ...data,
        ...(data.courseId !== undefined
          ? { courseId: data.courseId ?? null }
          : {}),
        ...(data.facultyId !== undefined
          ? { facultyId: data.facultyId ?? null }
          : {}),
        ...(data.facultyName !== undefined
          ? { facultyName: data.facultyName ?? null }
          : {}),
        ...(data.department !== undefined
          ? { department: data.department ?? null }
          : {}),
        ...(data.semester !== undefined
          ? { semester: data.semester ?? null }
          : {}),
        ...(data.batch !== undefined ? { batch: data.batch ?? null } : {}),
      },
    });
  }

  findById(id: string) {
    return this.prisma.timetable.findUnique({ where: { id } });
  }

  remove(id: string) {
    return this.prisma.timetable.delete({
      where: { id },
    });
  }
}
