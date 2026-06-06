import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TimetableRepository } from '../timetable/timetable.repository';
import type { ToolCallResult } from './ai-tools.service';

/**
 * AiAcademicToolsService
 *
 * Handles all student-academic-profile tools:
 *   - get_user_grades
 *   - get_user_attendance
 *   - get_user_schedule
 *   - get_upcoming_exams
 *   - get_enrolled_courses
 */
@Injectable()
export class AiAcademicToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly attendanceRepo: AttendanceRepository,
    private readonly timetableRepo: TimetableRepository,
  ) {}

  // ── Grades ───────────────────────────────────────────────────────────────

  async getGrades(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    const raw = await this.fetchGrades(userId);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The grades have been shown to the user in a formatted table. Write a short 1-2 sentence summary (e.g. CGPA, strongest subject). Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ gradesData: JSON.parse(raw) }],
    };
  }

  // ── Attendance ───────────────────────────────────────────────────────────

  async getAttendance(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    const raw = await this.fetchAttendance(userId);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The attendance report has been shown to the user in a formatted table with per-subject breakdown and skip/attend predictions. Write a short 1-2 sentence summary of their overall status. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ attendanceData: JSON.parse(raw) }],
    };
  }

  // ── Schedule ─────────────────────────────────────────────────────────────

  async getSchedule(
    userId: string | undefined,
    day?: string,
    courseCode?: string,
    startTime?: string,
  ): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    const raw = await this.fetchSchedule(userId, day, courseCode, startTime);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The filtered weekly timetable has been shown to the user in a formatted day-grouped schedule. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ scheduleData: JSON.parse(raw) }],
    };
  }

  // ── Upcoming Exams ───────────────────────────────────────────────────────

  async getUpcomingExams(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    return { functionResult: await this.fetchUpcomingExams(userId) };
  }

  // ── Enrolled Courses ─────────────────────────────────────────────────────

  async getEnrolledCourses(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    return { functionResult: await this.fetchEnrolledCourses(userId) };
  }

  // ── Private data-fetching helpers ─────────────────────────────────────────

  private gpToLetter(gp: number): string {
    if (gp >= 9.0) return 'A+';
    if (gp >= 8.0) return 'A';
    if (gp >= 7.0) return 'B+';
    if (gp >= 6.0) return 'B';
    if (gp >= 5.0) return 'C+';
    if (gp >= 4.0) return 'C';
    return 'F';
  }

  private async fetchGrades(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const entries = await this.prisma.cgpaEntry.findMany({
      where: { userId },
      orderBy: [{ semester: 'asc' }, { createdAt: 'desc' }],
      select: {
        subjectName: true,
        courseCode: true,
        gradePoint: true,
        credits: true,
        semester: true,
        courseType: true,
      },
    });

    if (!entries || entries.length === 0) {
      return JSON.stringify({
        user: user?.name ?? null,
        CGPA: null,
        subjects: [],
        message: 'No grade entries found. Add grades in the CGPA tracker.',
      });
    }

    const seen = new Set<string>();
    const subjects: Array<{
      code: string;
      name: string;
      grade: string;
      gradePoint: number;
      credits: number;
      semester: number;
      type: string;
    }> = [];

    let totalWeighted = 0;
    let totalCredits = 0;

    for (const e of entries) {
      const key = (e.subjectName || e.courseCode || 'Unknown').toLowerCase();
      const gp = Number(e.gradePoint ?? 0);
      const credits = Number(e.credits ?? 3);

      totalWeighted += gp * credits;
      totalCredits += credits;

      if (!seen.has(key)) {
        seen.add(key);
        subjects.push({
          code: e.courseCode ?? '—',
          name: e.subjectName ?? e.courseCode ?? 'Unknown',
          grade: this.gpToLetter(gp),
          gradePoint: gp,
          credits,
          semester: e.semester,
          type: e.courseType ?? 'core',
        });
      }
    }

    const cgpa = totalCredits > 0 ? Number((totalWeighted / totalCredits).toFixed(2)) : null;
    return JSON.stringify({ user: user?.name ?? null, CGPA: cgpa, subjects });
  }

  private async fetchAttendance(userId: string): Promise<string> {
    const TARGET = 75;
    const summary = await this.attendanceRepo.getStudentSummary(userId);

    if (!summary.courses || summary.courses.length === 0) {
      return JSON.stringify({
        totalSummary: { present: 0, total: 0, percentage: 0 },
        courses: [],
        message: 'No attendance records found yet.',
      });
    }

    const targetRatio = TARGET / 100;

    const enrichedCourses = summary.courses.map((course) => {
      const effectivePresent = course.present + course.late * 0.5;
      let needed = 0;
      let canSkip = 0;
      let statusMsg = '';

      if (course.percentage < TARGET) {
        needed = Math.ceil(
          (targetRatio * course.total - effectivePresent) / (1 - targetRatio),
        );
        needed = Math.max(0, needed);
        statusMsg = needed > 0 ? `Attend ${needed} more to reach 75%` : 'Borderline';
      } else {
        canSkip = Math.floor(effectivePresent / targetRatio - course.total);
        canSkip = Math.max(0, canSkip);
        statusMsg = canSkip > 0 ? `Safe to skip ${canSkip} classes` : 'Maintenance mode';
      }

      return {
        courseCode: course.courseCode,
        courseName: course.courseName,
        present: course.present,
        absent: course.absent,
        late: course.late,
        total: course.total,
        percentage: course.percentage,
        canSkip,
        needed,
        status: statusMsg,
      };
    });

    return JSON.stringify({ totalSummary: summary.totalSummary, courses: enrichedCourses });
  }

  private async fetchSchedule(
    userId: string,
    day?: string,
    courseCode?: string,
    startTime?: string,
  ): Promise<string> {
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { department: true, semester: true },
    });

    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId, status: 'active' },
      select: { courseId: true, courseCode: true, courseName: true, batch: true },
    });

    let entries: any[];

    if (enrollments.length > 0) {
      const courseIds = enrollments.map((e) => e.courseId).filter(Boolean) as string[];
      entries = await this.timetableRepo.findManyByCourseIds(courseIds);
    } else if (profile) {
      const result = await this.timetableRepo.findMany({
        department: profile.department,
        semester: profile.semester,
      } as any) as any;
      entries = (result as any).items ?? result;
    } else {
      return JSON.stringify({ message: 'No enrolled courses or student profile found.', schedule: [] });
    }

    if (!entries || entries.length === 0) {
      return JSON.stringify({ message: 'No timetable entries found for your courses yet.', schedule: [] });
    }

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: Record<string, any[]> = {};

    for (const entry of entries) {
      const entryDay = entry.day ?? 'Unknown';
      if (day && entryDay.toLowerCase() !== day.toLowerCase()) continue;
      if (courseCode && entry.courseCode?.toLowerCase() !== courseCode.toLowerCase()) continue;
      if (startTime && !entry.startTime?.includes(startTime)) continue;

      if (!grouped[entryDay]) grouped[entryDay] = [];
      grouped[entryDay].push({
        startTime: entry.startTime,
        endTime: entry.endTime,
        courseCode: entry.courseCode,
        courseName: entry.courseName,
        room: entry.room ?? '—',
        facultyName: entry.facultyName ?? '—',
      });
    }

    for (const d of Object.keys(grouped)) {
      grouped[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    const schedule = dayOrder
      .filter((d) => grouped[d] && grouped[d].length > 0)
      .map((d) => ({ day: d, entries: grouped[d] }));

    if (schedule.length === 0) {
      return JSON.stringify({
        message: 'No timetable entries found matching your specified filters.',
        schedule: [],
      });
    }

    return JSON.stringify({ schedule });
  }

  private async fetchUpcomingExams(userId: string): Promise<string> {
    try {
      const profile = await this.prisma.studentProfile.findUnique({
        where: { userId },
        select: { department: true },
      });

      if (!profile?.department) {
        return JSON.stringify({ message: 'No student profile found. Complete your profile first.', exams: [] });
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const exams = await this.prisma.examSchedule.findMany({
        where: {
          deletedAt: null,
          date: { gte: today },
          course: { department: profile.department },
        },
        orderBy: { date: 'asc' },
        take: 10,
        select: {
          courseCode: true,
          courseName: true,
          examType: true,
          date: true,
          startTime: true,
          endTime: true,
          room: true,
        },
      });

      if (exams.length === 0) {
        return JSON.stringify({ department: profile.department, message: 'No upcoming exams scheduled.', exams: [] });
      }

      return JSON.stringify({ department: profile.department, exams });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch exam schedule: ' + err.message });
    }
  }

  private async fetchEnrolledCourses(userId: string): Promise<string> {
    try {
      const enrollments = await this.prisma.enrollment.findMany({
        where: { studentId: userId, status: 'active' },
        orderBy: { enrolledAt: 'desc' },
        select: {
          courseId: true,
          courseName: true,
          courseCode: true,
          semester: true,
          batch: true,
          enrolledAt: true,
        },
      });

      if (enrollments.length === 0) {
        return JSON.stringify({ message: 'No active course enrollments found.', courses: [] });
      }

      return JSON.stringify({ courses: enrollments, total: enrollments.length });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch enrolled courses: ' + err.message });
    }
  }
}
