import { Injectable } from '@nestjs/common';
import { Prisma } from '@pec/database';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class HostelOutpassRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: any) {
    const where: Prisma.HostelOutpassWhereInput = {
      ...(query.studentId ? { studentId: query.studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
    };

    const total = await this.prisma.hostelOutpass.count({ where });
    const items = await this.prisma.hostelOutpass.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: query.limit ? Number(query.limit) : 50,
      skip: query.offset ? Number(query.offset) : 0,
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  findById(id: string) {
    return this.prisma.hostelOutpass.findUnique({ where: { id } });
  }

  create(data: any) {
    return this.prisma.hostelOutpass.create({
      data: {
        studentId: data.studentId,
        studentName: data.studentName,
        hostelName: data.hostelName || 'General',
        roomNumber: data.roomNumber,
        reason: data.reason,
        destination: data.destination,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        status: data.status || 'Pending',
        images: data.images || [],
        evidenceUrl: data.evidenceUrl,
      },
    });
  }

  update(id: string, data: any) {
    return this.prisma.hostelOutpass.update({
      where: { id },
      data: {
        ...(data.status ? { status: data.status } : {}),
        ...(data.approvedBy ? { approvedBy: data.approvedBy } : {}),
        ...(data.qrCode ? { qrCode: data.qrCode } : {}),
      },
    });
  }
}
