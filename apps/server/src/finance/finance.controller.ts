import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';

import { FinanceService } from './finance.service';
import { FeeQueryDto } from './dto/fee-query.dto';
import { CreateFeeDto } from './dto/create-fee.dto';
import { PayFeeDto } from './dto/pay-fee.dto';
import { TxnQueryDto } from './dto/txn-query.dto';
import { ok } from '../common/utils/api-response';
import { PdfService } from '../pdf/pdf.service';

@UseGuards(AuthGuard, PoliciesGuard)
@Controller('finance')
export class FinanceController {
  constructor(
    private readonly service: FinanceService,
    private readonly pdfService: PdfService,
  ) {}

  @CheckPolicies((ability) => ability.can('read', 'FeeRecord'))
  @Get('fee-receipt/:id')
  async getFeeReceipt(@Param('id') id: string, @Res() res: Response) {
    const pdfBuffer = await this.pdfService.generateFeeReceipt(id);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="fee-receipt-${id}.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    
    res.end(pdfBuffer);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────

  /** Student: own summary. Admin: pass ?studentId= */
  @CheckPolicies((ability) => ability.can('read', 'FeeRecord'))
  @Get('summary')
  async getSummary(@Request() req: any, @Query('studentId') studentId?: string) {
    const isAdmin = ['college_admin'].includes(req.user.role);
    const id = isAdmin && studentId ? studentId : req.user.sub;
    return ok(await this.service.getSummary(id));
  }

  // ─── Fees ─────────────────────────────────────────────────────────────────────

  @CheckPolicies((ability) => ability.can('read', 'FeeRecord'))
  @Get('fees')
  async getFees(@Request() req: any, @Query() q: FeeQueryDto) {
    const isAdmin = ['college_admin'].includes(req.user.role);
    const result = await this.service.findFees(q, req.user.sub, isAdmin);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @CheckPolicies((ability) => ability.can('create', 'FeeRecord'))
  @Post('fees')
  async createFee(@Body() body: CreateFeeDto) {
    return ok(await this.service.createFee(body));
  }

  @CheckPolicies((ability) => ability.can('update', 'FeeRecord'))
  @Patch('fees/:id')
  async updateFee(@Param('id') id: string, @Body() body: any) {
    return ok(await this.service.updateFee(id, body));
  }

  @CheckPolicies((ability) => ability.can('delete', 'FeeRecord'))
  @Delete('fees/:id')
  async deleteFee(@Param('id') id: string) {
    return ok(await this.service.deleteFee(id));
  }

  @CheckPolicies((ability) => ability.can('create', 'FeeRecord'))
  @Post('fees/bulk-monthly')
  async bulkMonthly(@Body() body: any) {
    return ok(await this.service.bulkCreateMonthlyFees(body));
  }

  // ─── Payments ─────────────────────────────────────────────────────────────────

  @CheckPolicies((ability) => ability.can('create', 'FeeRecord'))
  @Post('pay')
  async payFee(@Request() req: any, @Body() body: PayFeeDto) {
    return ok(await this.service.payFee(body, req.user.sub));
  }

  @CheckPolicies((ability) => ability.can('create', 'FeeRecord'))
  @Post('fees/:id/mark-paid')
  async markPaid(@Param('id') id: string, @Body('notes') notes?: string) {
    return ok(await this.service.adminMarkPaid(id, notes));
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────

  @CheckPolicies((ability) => ability.can('read', 'FeeRecord'))
  @Get('transactions')
  async getTransactions(@Request() req: any, @Query() q: TxnQueryDto) {
    const isAdmin = ['college_admin'].includes(req.user.role);
    const result = await this.service.findTransactions(q, req.user.sub, isAdmin);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @CheckPolicies((ability) => ability.can('read', 'FeeRecord'))
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string, @Request() req: any) {
    const isAdmin = ['college_admin'].includes(req.user.role);
    return ok(await this.service.getTransactionById(id, req.user.sub, isAdmin));
  }
}

