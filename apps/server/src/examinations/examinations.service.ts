import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExamScheduleDto } from './dto/create-exam-schedule.dto';
import { UpdateExamScheduleDto } from './dto/update-exam-schedule.dto';
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

    // Clash detection
    const clash = await this.prisma.examSchedule.findFirst({
      where: {
        room: dto.room,
        date: new Date(dto.date),
        deletedAt: null,
        AND: [
          { startTime: { lt: dto.endTime } },
          { endTime: { gt: dto.startTime } },
        ],
      },
    });

    if (clash) {
      throw new ConflictException(`Room ${dto.room} is already booked for ${clash.courseName} from ${clash.startTime} to ${clash.endTime}`);
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
      ['college_admin'].includes(role),
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
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.examType ? { examType: query.examType } : {}),
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

  async updateSchedule(id: string, dto: UpdateExamScheduleDto) {
    const dataToUpdate: any = { ...dto };
    if (dto.date) {
      dataToUpdate.date = new Date(dto.date);
    }
    
    // If course is updated, also update courseName and courseCode
    if (dto.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: dto.courseId },
        select: { name: true, code: true },
      });
      if (course) {
        dataToUpdate.courseName = course.name;
        dataToUpdate.courseCode = course.code;
      }
    }

    return this.prisma.examSchedule.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async deleteSchedule(id: string) {
    return this.prisma.examSchedule.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
