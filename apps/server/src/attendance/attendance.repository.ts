import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceQueryDto } from './dto/attendance-query.dto';
import { CreateAttendanceDto } from './dto/create-attendance.dto';
import { UpdateAttendanceDto } from './dto/update-attendance.dto';
import { BaseRepository } from '../common/repositories/base.repository';
import { randomUUID } from 'crypto';

type WaiverRequestRow = {
  id: string;
  student_id: string;
  course_id: string | null;
  course_code: string | null;
  course_name: string | null;
  from_date: Date;
  to_date: Date;
  reason: string;
  supporting_doc_url: string | null;
  status: string;
  reviewer_note: string | null;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class AttendanceRepository extends BaseRepository {
  private waiverTableReady: Promise<void> | null = null;

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  private async ensureWaiverTable(): Promise<void> {
    if (!this.waiverTableReady) {
      this.waiverTableReady = this.prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS attendance_waiver_requests (
          id TEXT PRIMARY KEY,
          student_id TEXT NOT NULL,
          course_id TEXT,
          course_code TEXT,
          course_name TEXT,
          from_date DATE NOT NULL,
          to_date DATE NOT NULL,
          reason TEXT NOT NULL,
          supporting_doc_url TEXT,
          status TEXT NOT NULL DEFAULT 'pending',
          reviewer_note TEXT,
          reviewer_id TEXT,
          reviewed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );

        CREATE INDEX IF NOT EXISTS idx_attendance_waiver_student_created
          ON attendance_waiver_requests(student_id, created_at DESC);

        CREATE INDEX IF NOT EXISTS idx_attendance_waiver_status_created
          ON attendance_waiver_requests(status, created_at DESC);
      `).then(() => undefined);
    }

    await this.waiverTableReady;
  }

  private mapWaiverRow(row: WaiverRequestRow) {
    return {
      id: row.id,
      studentId: row.student_id,
      courseId: row.course_id,
      courseCode: row.course_code,
      courseName: row.course_name,
      fromDate: row.from_date,
      toDate: row.to_date,
      reason: row.reason,
      supportingDocUrl: row.supporting_doc_url,
      status: row.status,
      reviewerNote: row.reviewer_note,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }

  async create(data: CreateAttendanceDto) {
    return this.prisma.attendance.create({
      data: {
        ...data,
        date: new Date(data.date),
      },
    });
  }

  async createWaiverRequest(data: {
    studentId: string;
    courseId?: string;
    courseCode?: string;
    courseName?: string;
    fromDate: string;
    toDate: string;
    reason: string;
    supportingDocUrl?: string;
  }) {
    await this.ensureWaiverTable();

    const id = randomUUID();

    const rows = await this.prisma.$queryRaw<WaiverRequestRow[]>`
      INSERT INTO attendance_waiver_requests (
        id,
        student_id,
        course_id,
        course_code,
        course_name,
        from_date,
        to_date,
        reason,
        supporting_doc_url,
        status
      ) VALUES (
        ${id},
        ${data.studentId},
        ${data.courseId ?? null},
        ${data.courseCode ?? null},
        ${data.courseName ?? null},
        ${new Date(data.fromDate)},
        ${new Date(data.toDate)},
        ${data.reason},
        ${data.supportingDocUrl ?? null},
        'pending'
      )
      RETURNING *
    `;

    return this.mapWaiverRow(rows[0]);
  }

  async getWaiverRequestsForStudent(studentId: string) {
    await this.ensureWaiverTable();

    const rows = await this.prisma.$queryRaw<WaiverRequestRow[]>`
      SELECT *
      FROM attendance_waiver_requests
      WHERE student_id = ${studentId}
      ORDER BY created_at DESC
      LIMIT 50
    `;

    return rows.map((row) => this.mapWaiverRow(row));
  }

  async findMany(query: AttendanceQueryDto) {
    const where = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.subject ? { subject: query.subject } : {}),
      ...(query.courseId ? { subject: query.courseId } : {}),
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
            select: { 
              id: true, 
              name: true, 
              code: true, 
              credits: true, 
              semester: true, 
              instructor: true, 
              department: true 
            }
          }
        }
      }),
      this.prisma.attendance.groupBy({
        by: ['courseId', 'subject', 'status'],
        where: { studentId },
        _count: { _all: true }
      })
    ]);

    const statsMap = new Map<string, { present: number; absent: number; late: number; total: number }>();
    
    aggregates.forEach(agg => {
       let courseId = agg.courseId;
       
       // Fallback: match subject to courseId or code if courseId is missing
       if (!courseId && agg.subject) {
         const match = enrollments.find(e => 
           e.courseId === agg.subject || 
           e.course.code === agg.subject || 
           e.course.name === agg.subject
         );
         if (match) courseId = match.courseId;
       }

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
        credits: en.course.credits,
        semester: en.course.semester,
        instructor: en.course.instructor,
        department: en.course.department,
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
