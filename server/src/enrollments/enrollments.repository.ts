import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class EnrollmentsRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: EnrollmentQueryDto) {
    const where = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.semester ? { semester: query.semester } : {}),
    };

    const { take, skip } = this.resolvePagination(query, 20, 200);

    const [items, total] = await Promise.all([
      this.prisma.enrollment.findMany({
        where,
        take,
        skip,
        orderBy: { enrolledAt: 'desc' },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
      this.prisma.enrollment.count({ where }),
    ]);

    return { items, total, limit: take, offset: skip };
  }

  create(data: CreateEnrollmentDto) {
    return this.prisma.enrollment.create({
      data: {
        ...data,
        enrolledAt: data.enrolledAt ? new Date(data.enrolledAt) : new Date(),
      },
    });
  }

  update(id: string, data: UpdateEnrollmentDto) {
    return this.prisma.enrollment.update({
      where: { id },
      data,
    });
  }

  async findEnrollmentBlockers(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        _count: {
          select: { enrollments: { where: { status: 'active' } } }
        }
      }
    });

    if (!course) return { blocked: true, reason: 'Course not found' };

    // 1. Capacity Check
    if (course._count.enrollments >= (course as any).capacity) {
      return { blocked: true, reason: 'Capacity full' };
    }

    // 2. Prerequisites Check
    if ((course as any).prerequisiteIds && (course as any).prerequisiteIds.length > 0) {
      const studentHistory = await this.prisma.enrollment.findMany({
        where: { studentId, status: 'active' }, // In a real system we'd check for status 'completed'
        select: { courseCode: true }
      });
      const historicalCodes = studentHistory.map(h => h.courseCode);
      const missing = (course as any).prerequisiteIds.filter((pid: string) => !historicalCodes.includes(pid));
      if (missing.length > 0) {
        return { blocked: true, reason: `Missing prerequisites: ${missing.join(', ')}` };
      }
    }

    return { blocked: false };
  }

  async findConflicts(studentId: string, targetCourseId: string) {
    const [currentEnrollments, newCourseSlots] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { studentId, status: 'active' },
        select: { courseId: true }
      }),
      this.prisma.timetable.findMany({
        where: { courseId: targetCourseId }
      })
    ]);

    const currentCourseIds = currentEnrollments.map(e => e.courseId);
    if (currentCourseIds.length === 0) return [];

    const existingSlots = await this.prisma.timetable.findMany({
      where: { courseId: { in: currentCourseIds } }
    });

    const conflicts: any[] = [];
    for (const newSlot of newCourseSlots) {
       const collision = existingSlots.find(existing => 
          existing.day === newSlot.day && 
          ((newSlot.startTime >= existing.startTime && newSlot.startTime < existing.endTime) ||
           (newSlot.endTime > existing.startTime && newSlot.endTime <= existing.endTime) ||
           (newSlot.startTime <= existing.startTime && newSlot.endTime >= existing.endTime))
       );
       if (collision) {
         conflicts.push({ 
           day: newSlot.day, 
           time: `${newSlot.startTime}-${newSlot.endTime}`,
           withCourse: collision.courseCode || collision.courseName || collision.courseId
         });
       }
    }
    
    return conflicts;
  }

  async removeByStudentAndCourse(studentId: string | undefined, courseId: string) {
    return this.prisma.enrollment.deleteMany({
      where: {
        ...(studentId ? { studentId } : {}),
        courseId,
      },
    });
  }

  findById(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
    });
  }
}
