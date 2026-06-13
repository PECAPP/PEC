import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as ExcelJS from 'exceljs';
import * as bcrypt from 'bcrypt';
import { S3Service } from '../common/services/s3.service';

@Injectable()
export class AdminService {
  async getDashboardStats() {
    const [students, faculty, courses, departments] = await Promise.all([
      this.prisma.user.count({ where: { roles: { some: { role: { name: 'student' } } } } }),
      this.prisma.user.count({ where: { roles: { some: { role: { name: 'faculty' } } } } }),
      this.prisma.course.count(),
      this.prisma.department.count(),
    ]);

    return {
      totalStudents: students,
      totalFaculty: faculty,
      totalCourses: courses,
      totalDepartments: departments,
    };
  }

  async getAuditLogs(limit: number = 100, offset: number = 0) {
    const [items, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.auditLog.count()
    ]);
    return { items, total, limit, offset };
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
  ) {}

  async processUserBulk(fileKey: string) {
    const buffer = await this.s3Service.getObjectBuffer(fileKey);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];

    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value?.toString() || `Column${colNumber}`;
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        data.push(rowData);
      }
    });

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

  async processAttendanceBulk(fileKey: string) {
    const buffer = await this.s3Service.getObjectBuffer(fileKey);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const worksheet = workbook.worksheets[0];

    const data: any[] = [];
    const headers: string[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) {
        row.eachCell((cell, colNumber) => {
          headers[colNumber] = cell.value?.toString() || `Column${colNumber}`;
        });
      } else {
        const rowData: any = {};
        row.eachCell((cell, colNumber) => {
          rowData[headers[colNumber]] = cell.value;
        });
        data.push(rowData);
      }
    });

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
