import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { FeeQueryDto } from './dto/fee-query.dto';
import { CreateFeeDto } from './dto/create-fee.dto';
import { PayFeeDto } from './dto/pay-fee.dto';
import { TxnQueryDto } from './dto/txn-query.dto';

function generateReceiptNo(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PEC-${ts}-${rand}`;
}

const LATE_FEE_PERCENT = 5; // 5% per month overdue (capped at 20%)

@Injectable()
export class FinanceRepository {
  constructor(private readonly prisma: PrismaService) {}

  // ─── Summary ─────────────────────────────────────────────────────────────────

  async getSummary(studentId: string) {
    const fees = await this.prisma.feeRecord.findMany({
      where: { studentId, deletedAt: null },
    });

    const totalPending = fees
      .filter((f) => f.status === 'pending')
      .reduce((s, f) => s + f.amount + f.lateFeeAmount, 0);

    const totalPaid = fees
      .filter((f) => f.status === 'paid')
      .reduce((s, f) => s + f.amount, 0);

    const overdue = fees.filter(
      (f) => f.status === 'pending' && new Date(f.dueDate) < new Date(),
    ).length;

    const byCategory: Record<string, { pending: number; paid: number }> = {};
    for (const f of fees) {
      if (!byCategory[f.category]) byCategory[f.category] = { pending: 0, paid: 0 };
      if (f.status === 'pending') byCategory[f.category].pending += f.amount + f.lateFeeAmount;
      if (f.status === 'paid') byCategory[f.category].paid += f.amount;
    }

    return { totalPending, totalPaid, overdue, byCategory };
  }

  // ─── Fees ─────────────────────────────────────────────────────────────────────

  async findFees(query: FeeQueryDto, requesterId: string, isAdmin: boolean) {
    const studentId = isAdmin ? query.studentId : requesterId;
    const limit = Number(query.limit ?? 50);
    const offset = Number(query.offset ?? 0);

    const where: Prisma.FeeRecordWhereInput = {
      deletedAt: null,
      ...(studentId ? { studentId } : {}),
      ...(query.category ? { category: query.category } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.semester ? { semester: query.semester } : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.feeRecord.count({ where }),
      this.prisma.feeRecord.findMany({
        where,
        orderBy: { dueDate: 'asc' },
        take: limit,
        skip: offset,
        include: {
          student: { select: { id: true, name: true, email: true } },
          transactions: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      }),
    ]);

    return { items, total, limit, offset };
  }

  async createFee(data: CreateFeeDto) {
    const student = await this.prisma.user.findUnique({ where: { id: data.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const fee = await this.prisma.feeRecord.create({
      data: {
        studentId: data.studentId,
        amount: Number(data.amount),
        description: data.description,
        category: data.category,
        dueDate: new Date(data.dueDate),
        semester: data.semester,
        month: data.month,
        status: 'pending',
      },
    });

    // Notify the student
    await this.prisma.notification.create({
      data: {
        userId: data.studentId,
        title: '🧾 New Fee Added',
        message: `A ${data.category} fee of ₹${data.amount} is due by ${new Date(data.dueDate).toLocaleDateString('en-IN')}.`,
        type: 'alert',
        link: '/finance',
      },
    });

    return fee;
  }

  async updateFee(id: string, updates: Partial<{ description: string; dueDate: string; amount: number; status: string }>) {
    return this.prisma.feeRecord.update({
      where: { id },
      data: {
        ...(updates.description !== undefined ? { description: updates.description } : {}),
        ...(updates.dueDate !== undefined ? { dueDate: new Date(updates.dueDate) } : {}),
        ...(updates.amount !== undefined ? { amount: Number(updates.amount) } : {}),
        ...(updates.status !== undefined ? { status: updates.status } : {}),
      },
    });
  }

  async deleteFee(id: string) {
    return this.prisma.feeRecord.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Payment ──────────────────────────────────────────────────────────────────

  async payFee(dto: PayFeeDto, studentId: string) {
    const fee = await this.prisma.feeRecord.findUnique({
      where: { id: dto.feeRecordId },
    });
    if (!fee) throw new NotFoundException('Fee record not found');
    if (fee.studentId !== studentId) throw new ForbiddenException('Not your fee');
    if (fee.status === 'paid') throw new BadRequestException('Fee already paid');
    if (fee.deletedAt) throw new BadRequestException('Fee record deleted');

    // Apply late fee if overdue
    let lateFee = 0;
    if (new Date(fee.dueDate) < new Date() && !fee.lateFeeApplied) {
      const monthsOverdue = Math.max(
        1,
        Math.ceil((Date.now() - new Date(fee.dueDate).getTime()) / (30 * 24 * 3600 * 1000)),
      );
      const pct = Math.min(monthsOverdue * LATE_FEE_PERCENT, 20) / 100;
      lateFee = Math.round(fee.amount * pct);
    }

    const totalAmount = fee.amount + (lateFee > 0 ? lateFee : fee.lateFeeAmount);
    const receiptNo = generateReceiptNo();

    // Simulate gateway: in production replace this with real Razorpay/Stripe call
    const gatewayTxnId = dto.gatewayTxnId ?? `SIM-${Date.now()}`;
    const paymentStatus = 'success'; // Simulated; set 'failed' on real gateway error

    const [transaction] = await this.prisma.$transaction([
      this.prisma.financeTransaction.create({
        data: {
          studentId,
          feeRecordId: fee.id,
          amount: totalAmount,
          paymentMethod: dto.paymentMethod ?? 'online',
          status: paymentStatus,
          gatewayTxnId,
          receiptNo,
          notes: dto.notes,
        },
      }),
      this.prisma.feeRecord.update({
        where: { id: fee.id },
        data: {
          status: paymentStatus === 'success' ? 'paid' : 'failed',
          paidDate: paymentStatus === 'success' ? new Date() : null,
          paymentTransactionId: gatewayTxnId,
          lastPaymentAttempt: new Date(),
          lateFeeApplied: lateFee > 0 ? true : fee.lateFeeApplied,
          lateFeeAmount: lateFee > 0 ? lateFee : fee.lateFeeAmount,
        },
      }),
    ]);

    if (paymentStatus === 'success') {
      await this.prisma.notification.create({
        data: {
          userId: studentId,
          title: '✅ Payment Successful',
          message: `₹${totalAmount.toLocaleString('en-IN')} paid for ${fee.category} fee. Receipt: ${receiptNo}`,
          type: 'success',
          link: '/finance',
        },
      });
    }

    return { transaction, fee: await this.prisma.feeRecord.findUnique({ where: { id: fee.id } }) };
  }

  async adminMarkPaid(feeId: string, notes?: string) {
    const fee = await this.prisma.feeRecord.findUnique({ where: { id: feeId } });
    if (!fee) throw new NotFoundException('Fee not found');
    if (fee.status === 'paid') throw new BadRequestException('Already paid');

    const receiptNo = generateReceiptNo();
    const [transaction] = await this.prisma.$transaction([
      this.prisma.financeTransaction.create({
        data: {
          studentId: fee.studentId,
          feeRecordId: fee.id,
          amount: fee.amount,
          paymentMethod: 'cash',
          status: 'success',
          receiptNo,
          notes: notes ?? 'Marked paid by admin',
        },
      }),
      this.prisma.feeRecord.update({
        where: { id: fee.id },
        data: { status: 'paid', paidDate: new Date() },
      }),
    ]);

    await this.prisma.notification.create({
      data: {
        userId: fee.studentId,
        title: '✅ Fee Marked as Paid',
        message: `Your ${fee.category} fee of ₹${fee.amount} has been marked paid. Receipt: ${receiptNo}`,
        type: 'success',
        link: '/finance',
      },
    });

    return transaction;
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────

  async findTransactions(query: TxnQueryDto, requesterId: string, isAdmin: boolean) {
    const studentId = isAdmin ? query.studentId : requesterId;
    const limit = Number(query.limit ?? 50);
    const offset = Number(query.offset ?? 0);

    const where: Prisma.FinanceTransactionWhereInput = {
      ...(studentId ? { studentId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
      ...(query.category
        ? { feeRecord: { category: query.category } }
        : {}),
    };

    const [total, items] = await Promise.all([
      this.prisma.financeTransaction.count({ where }),
      this.prisma.financeTransaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          feeRecord: { select: { category: true, description: true, semester: true, month: true } },
          student: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return { items, total, limit, offset };
  }

  async getTransactionById(id: string, requesterId: string, isAdmin: boolean) {
    const txn = await this.prisma.financeTransaction.findUnique({
      where: { id },
      include: {
        feeRecord: true,
        student: { select: { id: true, name: true, email: true, studentProfile: { select: { enrollmentNumber: true, department: true, semester: true } } } },
      },
    });
    if (!txn) throw new NotFoundException('Transaction not found');
    if (!isAdmin && txn.studentId !== requesterId) throw new ForbiddenException();
    return txn;
  }

  // ─── Admin bulk fee generation ────────────────────────────────────────────────

  async bulkCreateMonthlyFees(body: { category: string; amount: number; month: string; dueDate: string; description: string }) {
    const students = await this.prisma.user.findMany({
      where: { role: 'student' },
      select: { id: true },
    });

    const existing = await this.prisma.feeRecord.findMany({
      where: { category: body.category, month: body.month, deletedAt: null },
      select: { studentId: true },
    });
    const existingIds = new Set(existing.map((e) => e.studentId));
    const toCreate = students.filter((s) => !existingIds.has(s.id));

    if (toCreate.length === 0) return { created: 0, skipped: students.length };

    await this.prisma.feeRecord.createMany({
      data: toCreate.map((s) => ({
        studentId: s.id,
        amount: Number(body.amount),
        description: body.description,
        category: body.category,
        dueDate: new Date(body.dueDate),
        month: body.month,
        status: 'pending',
      })),
    });

    // Bulk notifications
    await this.prisma.notification.createMany({
      data: toCreate.map((s) => ({
        userId: s.id,
        title: `🧾 ${body.category.charAt(0).toUpperCase() + body.category.slice(1)} Fee for ${body.month}`,
        message: `₹${body.amount} due by ${new Date(body.dueDate).toLocaleDateString('en-IN')}.`,
        type: 'alert',
        link: '/finance',
      })),
    });

    return { created: toCreate.length, skipped: existingIds.size };
  }
}
