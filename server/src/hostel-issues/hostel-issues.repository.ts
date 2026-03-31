import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HostelIssueQueryDto } from './dto/hostel-issue-query.dto';
import { CreateHostelIssueDto } from './dto/create-hostel-issue.dto';
import { UpdateHostelIssueDto } from './dto/update-hostel-issue.dto';

@Injectable()
export class HostelIssuesRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDate(value?: string) {
    if (!value) return undefined;
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }

  async findMany(query: HostelIssueQueryDto) {
    const where: Prisma.HostelIssueWhereInput = {
      ...(query.studentId
        ? {
            studentId: Array.isArray(query.studentId)
              ? { in: query.studentId }
              : query.studentId,
          }
        : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.status__ne ? { NOT: { status: query.status__ne } } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
    };

    const total = await this.prisma.hostelIssue.count({ where });
    const items = await this.prisma.hostelIssue.findMany({
      where,
      orderBy: { [query.sortBy ?? 'createdAt']: query.sortOrder ?? 'desc' },
      take: query.limit,
      skip: query.offset,
    });

    return { items, total, limit: query.limit, offset: query.offset };
  }

  findById(id: string) {
    return this.prisma.hostelIssue.findUnique({ where: { id } });
  }

  create(data: CreateHostelIssueDto) {
    if (!data.studentId) {
      throw new Error('studentId is required to create a hostel issue');
    }
    return this.prisma.hostelIssue.create({
      data: {
        description: data.description,
        category: data.category,
        priority: data.priority,
        status: data.status ?? 'Open',
        roomNumber: data.roomNumber,
        studentId: data.studentId,
        studentName: data.studentName,
        hostelName: (data as any).hostelName || 'General',
        createdAt: this.toDate(data.createdAt),
      },
    });
  }

  async update(id: string, data: UpdateHostelIssueDto) {
    const existing = await this.prisma.hostelIssue.findUnique({
      where: { id },
    });
    const currentResponses = Array.isArray(existing?.responses)
      ? existing?.responses
      : [];

    let nextResponses: Prisma.JsonArray | undefined;
    const responsePatch = data.responses as
      | { _op?: string; val?: unknown }
      | unknown[]
      | undefined;

    if (Array.isArray(responsePatch)) {
      nextResponses = responsePatch as Prisma.JsonArray;
    } else if (
      responsePatch &&
      typeof responsePatch === 'object' &&
      (responsePatch as { _op?: string })._op === 'arrayUnion'
    ) {
      nextResponses = [
        ...currentResponses,
        (responsePatch as { val?: unknown }).val ?? null,
      ] as Prisma.JsonArray;
    } else if (
      responsePatch &&
      typeof responsePatch === 'object' &&
      (responsePatch as { _op?: string })._op === 'arrayRemove'
    ) {
      const removeVal = JSON.stringify(
        (responsePatch as { val?: unknown }).val ?? null,
      );
      nextResponses = currentResponses.filter(
        (item: Prisma.JsonValue) => JSON.stringify(item) !== removeVal,
      ) as Prisma.JsonArray;
    }

    return this.prisma.hostelIssue.update({
      where: { id },
      data: {
        ...(data.description ? { description: data.description } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.priority ? { priority: data.priority } : {}),
        ...(data.status ? { status: data.status } : {}),
        ...(data.roomNumber ? { roomNumber: data.roomNumber } : {}),
        ...(data.studentId ? { studentId: data.studentId } : {}),
        ...(data.studentName ? { studentName: data.studentName } : {}),
        ...(this.toDate(data.updatedAt)
          ? { updatedAt: this.toDate(data.updatedAt) }
          : {}),
      },
    });
  }

  delete(id: string) {
    return this.prisma.hostelIssue.delete({ where: { id } });
  }
}
