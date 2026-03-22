import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BaseRepository } from '../common/repositories/base.repository';
import { FeeRecordQueryDto } from './dto/fee-record-query.dto';
import { CreateFeeRecordDto } from './dto/create-fee-record.dto';
import { UpdateFeeRecordDto } from './dto/update-fee-record.dto';

@Injectable()
export class FeeRecordsRepository extends BaseRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findMany(query: FeeRecordQueryDto, requester?: { userId?: string; role?: string }) {
    const isStudent = requester?.role === 'student';
    const scopedStudentId = isStudent ? requester?.userId : query.studentId;

    const where: Prisma.FeeRecordWhereInput = {
      deletedAt: null,
      ...(scopedStudentId ? { studentId: scopedStudentId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...((query.minAmount || query.maxAmount)
        ? {
            amount: {
              ...(query.minAmount ? { gte: query.minAmount } : {}),
              ...(query.maxAmount ? { lte: query.maxAmount } : {}),
            },
          }
        : {}),
    };

    return this.findManyWithCount(this.prisma.feeRecord, {
      query,
      defaultLimit: 50,
      where,
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  }

  findById(id: string, requester?: { userId?: string; role?: string }) {
    const isStudent = requester?.role === 'student';
    return this.prisma.feeRecord.findFirst({
      where: {
        id,
        deletedAt: null,
        ...(isStudent ? { studentId: requester?.userId } : {}),
      },
    });
  }

  create(data: CreateFeeRecordDto) {
    return this.prisma.feeRecord.create({
      data: {
        studentId: data.studentId,
        amount: data.amount,
        description: data.description,
        dueDate: new Date(data.dueDate),
        category: data.category,
        status: data.status || 'pending',
        pendingTransactionId: data.pendingTransactionId || null,
        paymentTransactionId: data.paymentTransactionId || null,
      },
    });
  }

  update(id: string, data: UpdateFeeRecordDto, requester?: { userId?: string; role?: string }) {
    const isStudent = requester?.role === 'student';

    return this.prisma.feeRecord.updateMany({
      where: {
        id,
        deletedAt: null,
        ...(isStudent ? { studentId: requester?.userId } : {}),
      },
      data: {
        ...(data.studentId ? { studentId: data.studentId } : {}),
        ...(data.amount !== undefined ? { amount: data.amount } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.dueDate !== undefined ? { dueDate: new Date(data.dueDate) } : {}),
        ...(data.category !== undefined ? { category: data.category } : {}),
        ...(data.status !== undefined ? { status: data.status } : {}),
        ...(data.pendingTransactionId !== undefined
          ? { pendingTransactionId: data.pendingTransactionId }
          : {}),
        ...(data.paymentTransactionId !== undefined
          ? { paymentTransactionId: data.paymentTransactionId }
          : {}),
        ...(data.paidDate !== undefined
          ? { paidDate: data.paidDate ? new Date(data.paidDate) : null }
          : {}),
        ...(data.verificationSubmittedAt !== undefined
          ? {
              verificationSubmittedAt: data.verificationSubmittedAt
                ? new Date(data.verificationSubmittedAt)
                : null,
            }
          : {}),
        ...(data.lastPaymentAttempt !== undefined
          ? {
              lastPaymentAttempt: data.lastPaymentAttempt
                ? new Date(data.lastPaymentAttempt)
                : null,
            }
          : {}),
      },
    });
  }

  async remove(id: string) {
    await this.prisma.feeRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return { deleted: true };
  }
}
