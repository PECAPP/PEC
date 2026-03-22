import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class AssignmentsRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: AssignmentQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.title
        ? {
            title: {
              contains: query.title,
              mode: 'insensitive' as const,
            },
          }
        : {}),
      ...(query.dueAfter || query.dueBefore
        ? {
            dueDate: {
              ...(query.dueAfter ? { gte: new Date(query.dueAfter) } : {}),
              ...(query.dueBefore ? { lte: new Date(query.dueBefore) } : {}),
            },
          }
        : {}),
    };

    return this.findManyWithCount(this.prisma.assignment, {
      query,
      defaultLimit: 20,
      where,
      orderBy: { dueDate: 'asc' },
    });
  }

  findById(id: string) {
    return this.prisma.assignment.findFirst({
      where: { id, deletedAt: null },
    });
  }

  create(data: CreateAssignmentDto) {
    return this.prisma.assignment.create({
      data: {
        ...data,
        dueDate: new Date(data.dueDate),
      },
    });
  }

  update(id: string, data: UpdateAssignmentDto) {
    return this.prisma.assignment.update({
      where: { id },
      data: {
        ...data,
        ...(data.dueDate ? { dueDate: new Date(data.dueDate) } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.assignment.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
