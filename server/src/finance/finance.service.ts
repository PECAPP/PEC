import { Injectable } from '@nestjs/common';
import { FinanceRepository } from './finance.repository';
import { FeeQueryDto } from './dto/fee-query.dto';
import { CreateFeeDto } from './dto/create-fee.dto';
import { PayFeeDto } from './dto/pay-fee.dto';
import { TxnQueryDto } from './dto/txn-query.dto';

@Injectable()
export class FinanceService {
  constructor(private readonly repo: FinanceRepository) {}

  getSummary(studentId: string) { return this.repo.getSummary(studentId); }
  findFees(q: FeeQueryDto, requesterId: string, isAdmin: boolean) { return this.repo.findFees(q, requesterId, isAdmin); }
  createFee(data: CreateFeeDto) { return this.repo.createFee(data); }
  updateFee(id: string, updates: any) { return this.repo.updateFee(id, updates); }
  deleteFee(id: string) { return this.repo.deleteFee(id); }
  payFee(dto: PayFeeDto, studentId: string) { return this.repo.payFee(dto, studentId); }
  adminMarkPaid(feeId: string, notes?: string) { return this.repo.adminMarkPaid(feeId, notes); }
  findTransactions(q: TxnQueryDto, requesterId: string, isAdmin: boolean) { return this.repo.findTransactions(q, requesterId, isAdmin); }
  getTransactionById(id: string, requesterId: string, isAdmin: boolean) { return this.repo.getTransactionById(id, requesterId, isAdmin); }
  bulkCreateMonthlyFees(body: any) { return this.repo.bulkCreateMonthlyFees(body); }
}
