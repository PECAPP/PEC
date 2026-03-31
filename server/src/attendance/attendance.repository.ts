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

  async getFacultyStats(facultyId: string) {
    const courses = await this.prisma.course.findMany({
      where: { facultyId, deletedAt: null },
      include: { _count: { select: { enrollments: true } } }
    });

    const courseIds = courses.map(c => c.id);
    
    // Group attendance by status for all courses taught by this faculty
    const statusCounts = await this.prisma.attendance.groupBy({
      by: ['status'],
      where: { 
        courseId: { in: courseIds } 
      },
      _count: { _all: true }
    });

    const activeCount = courses.length;
    const studentCount = courses.reduce((acc, curr) => acc + curr._count.enrollments, 0);

    return {
      activeCount,
      studentCount,
      courses: courses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        students: c._count.enrollments
      }))
    };
  }

  async getStudentSummary(studentId: string) {
    const [enrollments, aggregates] = await Promise.all([
      this.prisma.enrollment.findMany({
        where: { studentId, status: 'active' },
        include: { 
          course: {
            select: { name: true, code: true }
          }
        }
      }),
      this.prisma.attendance.groupBy({
        by: ['courseId', 'status'],
        where: { studentId },
        _count: { _all: true }
      })
    ]);

    const statsMap = new Map<string, { present: number; absent: number; late: number; total: number }>();
    
    aggregates.forEach(agg => {
       const courseId = agg.courseId;
       if (!courseId) return;
       
       const current = statsMap.get(courseId) || { present: 0, absent: 0, late: 0, total: 0 };
       const count = agg._count._all;
       
       if (agg.status === 'present') current.present += count;
       else if (agg.status === 'absent') current.absent += count;
       else if (agg.status === 'late') current.late += count;
       
       current.total += count;
       statsMap.set(courseId, current);
    });

    const courses = enrollments.map(en => {
      const stats = statsMap.get(en.courseId) || { present: 0, absent: 0, late: 0, total: 0 };
      const percentage = stats.total > 0 ? Math.round(((stats.present + (stats.late * 0.5)) / stats.total) * 100) : 0;
      
      return {
        courseId: en.courseId,
        courseCode: en.course.code,
        courseName: en.course.name,
        present: stats.present,
        late: stats.late,
        absent: stats.absent,
        total: stats.total,
        percentage
      };
    });

    const totalStats = { present: 0, total: 0 };
    statsMap.forEach(s => {
       totalStats.present += (s.present + (s.late * 0.5));
       totalStats.total += s.total;
    });

    return {
      courses,
      totalSummary: {
        present: Math.round(totalStats.present),
        total: totalStats.total,
        percentage: totalStats.total > 0 ? Math.round((totalStats.present / totalStats.total) * 100) : 0
      }
    };
  }

  findById(id: string) {
    return this.prisma.attendance.findUnique({ where: { id } });
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
