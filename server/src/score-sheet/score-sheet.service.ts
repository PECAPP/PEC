import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScoreEntryDto } from './dto/create-score-entry.dto';
import { ScoreEntryQueryDto } from './dto/score-entry-query.dto';

@Injectable()
export class ScoreSheetService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: ScoreEntryQueryDto) {
    const where: any = {};
    if (query.studentId) where.studentId = query.studentId;
    if (query.courseCode) where.courseCode = query.courseCode;

    return this.prisma.scoreEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  async create(data: CreateScoreEntryDto) {
    return this.prisma.scoreEntry.create({ data });
  }

  async update(id: string, data: Partial<CreateScoreEntryDto>) {
    return this.prisma.scoreEntry.update({ where: { id }, data });
  }

  async delete(id: string) {
    return this.prisma.scoreEntry.delete({ where: { id } });
  }

  async getStats(studentId: string) {
    const entries = await this.prisma.scoreEntry.findMany({
      where: { studentId },
    });

    if (entries.length === 0) {
      return { average: 0, total: 0, best: 0 };
    }

    const percentages = entries.map((e) =>
      e.maxMarks > 0 ? Math.min(100, (e.score / e.maxMarks) * 100) : 0
    );
    const average = Math.round(
      percentages.reduce((sum, v) => sum + v, 0) / percentages.length
    );
    const best = Math.round(Math.max(...percentages));

    return { average, total: entries.length, best };
  }
}
