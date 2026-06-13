import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { assertCourseOwnershipByCode } from '../common/utils/ownership.utils';

@Injectable()
export class GradingService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Helper to determine Grade and Grade Point from absolute score.
   */
  private getGradeData(percentage: number): { grade: string; gradePoint: number } {
    if (percentage >= 90) return { grade: 'A+', gradePoint: 10 };
    if (percentage >= 80) return { grade: 'A', gradePoint: 9 };
    if (percentage >= 70) return { grade: 'B+', gradePoint: 8 };
    if (percentage >= 60) return { grade: 'B', gradePoint: 7 };
    if (percentage >= 50) return { grade: 'C+', gradePoint: 6 };
    if (percentage >= 40) return { grade: 'C', gradePoint: 5 };
    return { grade: 'F', gradePoint: 0 };
  }

  /**
   * Submit raw scores for a student. Automatically calculates the grade,
   * creates/updates the ScoreEntry, and pushes a CgpaEntry.
   */
  async submitScore(data: {
    studentId: string;
    courseName: string;
    courseCode?: string;
    term?: string;
    semester: number;
    credits: number;
    maxMarks?: number;
    score: number;
    examDate?: string;
    notes?: string;
  }, user?: any) {
    if (user?.role === 'faculty') {
      if (!data.courseCode) {
        throw new BadRequestException('courseCode is required for faculty score submission');
      }
      await assertCourseOwnershipByCode(user.sub, data.courseCode, this.prisma);
    }

    const maxMarks = data.maxMarks || 100;
    const percentage = (data.score / maxMarks) * 100;
    const { grade, gradePoint } = this.getGradeData(percentage);

    // Write to ScoreEntry
    const scoreEntry = await this.prisma.scoreEntry.create({
      data: {
        studentId: data.studentId,
        courseName: data.courseName,
        courseCode: data.courseCode,
        term: data.term,
        maxMarks,
        score: data.score,
        grade,
        examDate: data.examDate ? new Date(data.examDate) : new Date(),
        notes: data.notes,
      },
    });

    // Write to CgpaEntry automatically
    const cgpaEntry = await this.prisma.cgpaEntry.create({
      data: {
        userId: data.studentId,
        subjectName: data.courseName,
        courseCode: data.courseCode,
        semester: data.semester,
        credits: data.credits,
        gradePoint,
        examDate: data.examDate ? new Date(data.examDate) : new Date(),
        notes: `Auto-generated from ScoreEntry ${scoreEntry.id}`,
      },
    });

    return { scoreEntry, cgpaEntry };
  }

  /**
   * Update an existing ScoreEntry
   */
  async updateScore(scoreId: string, data: { score: number; maxMarks?: number }, user?: any) {
    const existing = await this.prisma.scoreEntry.findUnique({
      where: { id: scoreId },
    });

    if (!existing) {
      throw new NotFoundException('ScoreEntry not found');
    }

    if (user?.role === 'faculty') {
      if (!existing.courseCode) {
        throw new ForbiddenException('Cannot verify course ownership for this entry');
      }
      await assertCourseOwnershipByCode(user.sub, existing.courseCode, this.prisma);
    }

    const maxMarks = data.maxMarks || existing.maxMarks;
    const percentage = (data.score / maxMarks) * 100;
    const { grade } = this.getGradeData(percentage);

    return this.prisma.scoreEntry.update({
      where: { id: scoreId },
      data: {
        score: data.score,
        maxMarks,
        grade,
      },
    });
  }

  /**
   * Calculate SGPA for a given semester
   */
  async calculateSGPA(studentId: string, semester: number) {
    const entries = await this.prisma.cgpaEntry.findMany({
      where: { userId: studentId, semester },
    });

    if (entries.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    for (const entry of entries) {
      totalPoints += entry.gradePoint * entry.credits;
      totalCredits += entry.credits;
    }

    if (totalCredits === 0) return 0;
    return Number((totalPoints / totalCredits).toFixed(2));
  }

  /**
   * Calculate overall CGPA across all semesters
   */
  async calculateCGPA(studentId: string) {
    const entries = await this.prisma.cgpaEntry.findMany({
      where: { userId: studentId },
    });

    if (entries.length === 0) return 0;

    let totalPoints = 0;
    let totalCredits = 0;

    for (const entry of entries) {
      totalPoints += entry.gradePoint * entry.credits;
      totalCredits += entry.credits;
    }

    if (totalCredits === 0) return 0;
    return Number((totalPoints / totalCredits).toFixed(2));
  }
}
