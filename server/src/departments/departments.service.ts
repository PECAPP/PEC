import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DepartmentQueryDto } from './dto/department-query.dto';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: DepartmentQueryDto) {
    const limit = Math.min(Math.max(query.limit ?? 100, 1), 200);
    const offset = Math.max(query.offset ?? 0, 0);

    const where: Prisma.DepartmentWhereInput = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.search
        ? {
            OR: [
              { code: { contains: query.search, mode: 'insensitive' } },
              { name: { contains: query.search, mode: 'insensitive' } },
              { hod: { contains: query.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.department.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: [{ code: 'asc' }],
      }),
      this.prisma.department.count({ where }),
    ]);

    return { items, total, limit, offset };
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department) {
      throw new NotFoundException('Department not found');
    }

    return department;
  }

  create(data: CreateDepartmentDto) {
    return this.prisma.department.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        hod: data.hod?.trim() || null,
        description: data.description?.trim() || null,
        status: data.status?.trim() || 'active',
        timetableLabel: data.timetableLabel?.trim() || null,
      },
    });
  }

  update(id: string, data: UpdateDepartmentDto) {
    return this.prisma.department.update({
      where: { id },
      data: {
        ...(data.code ? { code: data.code.trim().toUpperCase() } : {}),
        ...(data.name ? { name: data.name.trim() } : {}),
        ...(data.hod !== undefined ? { hod: data.hod?.trim() || null } : {}),
        ...(data.description !== undefined
          ? { description: data.description?.trim() || null }
          : {}),
        ...(data.status ? { status: data.status.trim() } : {}),
        ...(data.timetableLabel !== undefined
          ? { timetableLabel: data.timetableLabel?.trim() || null }
          : {}),
      },
    });
  }

  remove(id: string) {
    return this.prisma.department.delete({
      where: { id },
    });
  }
}
