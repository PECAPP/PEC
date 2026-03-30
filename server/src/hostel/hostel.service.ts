import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostelService {
  constructor(private readonly prisma: PrismaService) {}

  private get prismaAny() {
    return this.prisma as any;
  }

  findAllForStudent(studentId: string) {
    return this.prismaAny.hostelIssue.findMany({
      where: { studentId },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll() {
    return this.prismaAny.hostelIssue.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  create(data: any) {
    return this.prismaAny.hostelIssue.create({
      data: {
        ...data,
        createdAt: data.createdAt ? new Date(data.createdAt) : new Date(),
        updatedAt: new Date(),
      },
    });
  }

  update(id: string, data: any) {
    return this.prismaAny.hostelIssue.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });
  }
}
