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

  findById(id: string) {
    return this.prisma.enrollment.findUnique({
      where: { id },
    });
  }
}
