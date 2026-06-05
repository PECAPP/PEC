import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as xlsx from 'xlsx';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  async getDashboardStats() {
    const [students, faculty, courses, departments] = await Promise.all([
      this.prisma.user.count({ where: { role: 'student' } }),
      this.prisma.user.count({ where: { role: 'faculty' } }),
      this.prisma.course.count({ where: { deletedAt: null } }),
      this.prisma.department.count(),
    ]);

    return {
      totalStudents: students,
      totalFaculty: faculty,
      totalCourses: courses,
      totalDepartments: departments,
    };
  }

  constructor(private readonly prisma: PrismaService) {}

  async processUserBulk(file: Express.Multer.File) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = { imported: 0, failed: 0, errors: [] as any[] };

    for (const row of data as any[]) {
      try {
        const { email, name, role, password, department, semester, enrollmentNumber } = row;
        
        if (!email || !name || !role) throw new Error('Missing required fields');

        const hashedPassword = await bcrypt.hash(password || 'password123', 10);
        
        await this.prisma.user.create({
          data: {
            email,
            name,
            role,
            password: hashedPassword,
            ...(role === 'student' ? {
              studentProfile: {
                create: {
                  enrollmentNumber: enrollmentNumber || `PEC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
                  department: department || 'General',
                  semester: parseInt(semester) || 1,
                }
              }
            } : {})
          }
        });
        results.imported++;
      } catch (e) {
        results.failed++;
        results.errors.push({ email: (row as any).email, error: e.message });
      }
    }

    return results;
  }

  async processAttendanceBulk(file: Express.Multer.File) {
    const workbook = xlsx.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const results = { imported: 0, failed: 0, errors: [] as any[] };

    for (const row of data as any[]) {
      try {
        const { email, date, subject, status } = row;
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error(`User with email ${email} not found`);

        await this.prisma.attendance.upsert({
          where: {
            studentId_date_subject: {
              studentId: user.id,
              date: new Date(date),
              subject
            }
          },
          update: { status },
          create: {
            studentId: user.id,
            date: new Date(date),
            subject,
            status
          }
        });
        results.imported++;
      } catch (e) {
        results.failed++;
        results.errors.push({ row, error: e.message });
      }
    }
    return results;
  }
}
