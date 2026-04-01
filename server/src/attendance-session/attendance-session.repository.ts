import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AttendanceSession, Prisma } from '@prisma/client';

@Injectable()
export class AttendanceSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.AttendanceSessionCreateInput): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.create({ data });
  }

  async findById(id: string): Promise<AttendanceSession | null> {
    return this.prisma.attendanceSession.findUnique({
      where: { id },
    });
  }

  async findByQrCode(qrCode: string): Promise<AttendanceSession | null> {
    return this.prisma.attendanceSession.findUnique({
      where: { qrCode },
    });
  }

  async findAll(where?: Prisma.AttendanceSessionWhereInput): Promise<AttendanceSession[]> {
    return this.prisma.attendanceSession.findMany({ where });
  }

  async update(id: string, data: Prisma.AttendanceSessionUpdateInput): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.update({
      where: { id },
      data,
    });
  }

  async remove(id: string): Promise<AttendanceSession> {
    return this.prisma.attendanceSession.delete({
      where: { id },
    });
  }
}
