import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { CreateGradeDto } from './dto/create-grade.dto';
import { ExamQueryDto } from './dto/exam-query.dto';
import { GradeQueryDto } from './dto/grade-query.dto';

@Injectable()
export class ExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  async createSchedule(dto: CreateExamScheduleDto) {
    const course = await this.prisma.course.findUnique({
      where: { id: dto.courseId },
      select: { id: true, name: true, code: true },
    });

    if (!course) {
      throw new NotFoundException('Course not found');
    }

    return this.prisma.examSchedule.create({
      data: {
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        examType: dto.examType,
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        room: dto.room,
      },
    });
  }

  async listSchedules(query: ExamQueryDto) {
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
    const offset = Math.max(query.offset ?? 0, 0);
    const where = {
      deletedAt: null,
      ...(query.courseId ? { courseId: query.courseId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.examSchedule.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { date: 'asc' },
      }),
      this.prisma.examSchedule.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async deleteSchedule(id: string) {
    return this.prisma.examSchedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  async upsertGrade(dto: CreateGradeDto) {
    return this.prisma.grade.upsert({
      where: {
        studentId_courseId: {
          studentId: dto.studentId,
          courseId: dto.courseId,
        },
      },
      update: {
        midterm: dto.midterm,
        final: dto.final,
        total: dto.total,
        grade: dto.grade,
        credits: dto.credits,
        remarks: dto.remarks,
      },
      create: {
        studentId: dto.studentId,
        courseId: dto.courseId,
        midterm: dto.midterm,
        final: dto.final,
        total: dto.total,
        grade: dto.grade,
        credits: dto.credits,
        remarks: dto.remarks,
      },
    });
  }

  async listGrades(query: GradeQueryDto) {
    const limit = Math.min(Math.max(query.limit ?? 200, 1), 500);
    const offset = Math.max(query.offset ?? 0, 0);
    const where = {
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.studentId ? { studentId: query.studentId } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.grade.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { updatedAt: 'desc' },
      }),
      this.prisma.grade.count({ where }),
    ]);

    return { items, total, limit, offset };
  }
}
