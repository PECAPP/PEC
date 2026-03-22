import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class CoursesRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: CourseQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.department ? { department: query.department } : {}),
      ...(query.semester ? { semester: query.semester } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const sortBy = query.sortBy ?? 'name';
    const sortOrder = query.sortOrder ?? 'asc';

    return this.findManyWithCount(this.prisma.course, {
      query,
      defaultLimit: 20,
      where,
      orderBy: {
        [sortBy]: sortOrder,
      },
    });
  }

  findById(id: string) {
    return this.prisma.course.findFirst({
      where: { id, deletedAt: null },
    });
  }

  create(data: CreateCourseDto) {
    return this.prisma.course.create({ data });
  }

  update(id: string, data: UpdateCourseDto) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  remove(id: string) {
    return this.prisma.course.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
