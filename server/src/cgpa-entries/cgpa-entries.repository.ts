import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CgpaEntryQueryDto } from './dto/cgpa-entry-query.dto';
import { CreateCgpaEntryDto } from './dto/create-cgpa-entry.dto';
import { UpdateCgpaEntryDto } from './dto/update-cgpa-entry.dto';

@Injectable()
export class CgpaEntriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findManyByUser(userId: string, query: CgpaEntryQueryDto) {
    const where = {
      userId,
      ...(query.semester ? { semester: query.semester } : {}),
    };

    const requestedLimit = query.limit ?? 200;
    const take = Math.min(Math.max(requestedLimit, 1), 2000);
    const skip = Math.max(query.offset ?? 0, 0);
    const sortBy = query.sortBy ?? 'createdAt';
    const sortOrder = query.sortOrder ?? 'desc';
    const db = this.prisma as any;

    const [items, total] = await Promise.all([
      db.cgpaEntry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        take,
        skip,
      }),
      db.cgpaEntry.count({ where }),
    ]);

    return { items, total, limit: take, offset: skip };
  }

  findById(id: string): Promise<any> {
    return (this.prisma as any).cgpaEntry.findUnique({ where: { id } });
  }

  createForUser(userId: string, data: CreateCgpaEntryDto): Promise<any> {
    return (this.prisma as any).cgpaEntry.create({
      data: {
        userId,
        subjectName: data.subjectName.trim(),
        courseId: data.courseId || null,
        courseCode: data.courseCode?.trim() || null,
        semester: data.semester,
        credits: data.credits,
        gradePoint: data.gradePoint,
        courseType: data.courseType || 'core',
        examDate: data.examDate ? new Date(data.examDate) : null,
        notes: data.notes?.trim() || null,
      },
    });
  }

  update(id: string, data: UpdateCgpaEntryDto): Promise<any> {
    return (this.prisma as any).cgpaEntry.update({
      where: { id },
      data: {
        ...(typeof data.subjectName === 'string'
          ? { subjectName: data.subjectName.trim() }
          : {}),
        ...(data.courseId !== undefined ? { courseId: data.courseId || null } : {}),
        ...(data.courseCode !== undefined
          ? { courseCode: data.courseCode?.trim() || null }
          : {}),
        ...(data.semester !== undefined ? { semester: data.semester } : {}),
        ...(data.credits !== undefined ? { credits: data.credits } : {}),
        ...(data.gradePoint !== undefined ? { gradePoint: data.gradePoint } : {}),
        ...(data.courseType !== undefined ? { courseType: data.courseType } : {}),
        ...(data.examDate !== undefined
          ? { examDate: data.examDate ? new Date(data.examDate) : null }
          : {}),
        ...(data.notes !== undefined ? { notes: data.notes?.trim() || null } : {}),
      },
    });
  }

  remove(id: string): Promise<any> {
    return (this.prisma as any).cgpaEntry.delete({ where: { id } });
  }
}
