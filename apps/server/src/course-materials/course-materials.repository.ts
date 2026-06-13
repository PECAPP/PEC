import { Injectable } from '@nestjs/common';
import { Prisma } from '@pec/database';
import { PrismaService } from '../prisma/prisma.service';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';

@Injectable()
export class CourseMaterialsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: CourseMaterialQueryDto) {
    const where: Prisma.CourseMaterialWhereInput = {
      ...(query.courseId ? { courseId: query.courseId } : {}),
      ...(query.uploadedBy ? { uploadedBy: query.uploadedBy } : {}),
      ...(query.type ? { type: query.type } : {}),
    };

    return this.prisma.courseMaterial.findMany({ where,
      orderBy: { [query.sortBy ?? 'uploadedAt']: query.sortOrder ?? 'desc' },
      take: query.limit,
      skip: query.offset,
    });
  }

  create(data: CreateCourseMaterialDto) {
    return this.prisma.courseMaterial.create({
      data: {
        courseId: data.courseId,
        courseName: data.courseName,
        courseCode: data.courseCode,
        title: data.title,
        fileURL: data.fileURL,
        uploadedBy: data.uploadedBy,
        description: data.description ?? '',
        type: data.type ?? 'other',
      },
    });
  }

  update(id: string, data: Partial<CreateCourseMaterialDto>) {
    return this.prisma.courseMaterial.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.courseMaterial.delete({ where: { id } });
  }
}
