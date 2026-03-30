import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { ExamQueryDto } from './dto/exam-query.dto';

@Injectable()
export class ExaminationsService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveRequesterDepartment(userId?: string): Promise<string | null> {
    if (!userId) {
      return null;
    }

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        studentProfile: {
          select: {
            department: true,
          },
        },
        facultyProfile: {
          select: {
            department: true,
          },
        },
      },
    });

    return (
      user?.facultyProfile?.department ??
      user?.studentProfile?.department ??
      null
    );
  }

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

  async listSchedules(
    query: ExamQueryDto,
    requester?: { userId?: string; roles?: string[] },
  ) {
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 500);
    const offset = Math.max(query.offset ?? 0, 0);
    const requesterRoles = requester?.roles ?? [];
    const isAdminScope = requesterRoles.some((role) =>
      ['college_admin', 'admin', 'moderator'].includes(role),
    );
    const scopedDepartment = isAdminScope
      ? query.department
      : await this.resolveRequesterDepartment(requester?.userId);
    const upcomingOnly = isAdminScope ? !!query.upcoming : true;

    if (!isAdminScope && !scopedDepartment) {
      return {
        items: [],
        total: 0,
        limit,
        offset,
      };
    }

    const where = {
      deletedAt: null,
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(scopedDepartment
        ? {
            course: {
              department: scopedDepartment,
            },
          }
        : {}),
      ...(upcomingOnly
        ? {
            date: {
              gte: (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return today;
              })(),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.examSchedule.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { date: 'asc' },
        include: {
          course: {
            select: {
              department: true,
            },
          },
        },
      }),
      this.prisma.examSchedule.count({ where }),
    ]);

    return {
      items: items.map((item) => ({
        ...item,
        department: item.course?.department ?? null,
      })),
      total,
      limit,
      offset,
    };
  }

  async deleteSchedule(id: string) {
    return this.prisma.examSchedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
