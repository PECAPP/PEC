import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JobQueryDto } from './dto/job-query.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { BaseRepository } from '../common/repositories/base.repository';

@Injectable()
export class JobsRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: JobQueryDto) {
    const where = {
      deletedAt: null,
      ...(query.company ? { company: query.company } : {}),
      ...(query.type ? { type: query.type } : {}),
      ...(query.location ? { location: query.location } : {}),
    };

    const sortBy = query.sortBy ?? 'deadline';
    const sortOrder = query.sortOrder ?? 'asc';

    return this.findManyWithCount(this.prisma.job, {
      query,
      defaultLimit: 20,
      where,
      orderBy: { [sortBy]: sortOrder },
    });
  }

  findById(id: string) {
    return this.prisma.job.findFirst({ where: { id, deletedAt: null } });
  }

  create(data: CreateJobDto) {
    return this.prisma.job.create({
      data: {
        ...data,
        deadline: new Date(data.deadline),
      },
    });
  }

  update(id: string, data: UpdateJobDto) {
    return this.prisma.job.update({
      where: { id },
      data: {
        ...data,
        ...(data.deadline ? { deadline: new Date(data.deadline) } : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.job.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
