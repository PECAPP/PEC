import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      orderBy: [{ subject: 'asc' }, { action: 'asc' }],
    });
  }

  async create(data: { action: string; subject: string; conditions?: any; description?: string }) {
    return this.prisma.permission.create({
      data,
    });
  }

  async findOne(id: string) {
    const permission = await this.prisma.permission.findUnique({ where: { id } });
    if (!permission) throw new NotFoundException('Permission not found');
    return permission;
  }

  async update(id: string, data: any) {
    return this.prisma.permission.update({
      where: { id },
      data,
    });
  }

  async remove(id: string) {
    return this.prisma.permission.delete({ where: { id } });
  }
}
