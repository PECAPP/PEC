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
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { FinanceService } from './finance.service';
import { FeeQueryDto } from './dto/fee-query.dto';
import { CreateFeeDto } from './dto/create-fee.dto';
import { PayFeeDto } from './dto/pay-fee.dto';
import { TxnQueryDto } from './dto/txn-query.dto';
import { ok } from '../common/utils/api-response';

@UseGuards(AuthGuard, RolesGuard)
@Controller('finance')
export class FinanceController {
  constructor(private readonly service: FinanceService) {}

  // ─── Summary ─────────────────────────────────────────────────────────────────

  /** Student: own summary. Admin: pass ?studentId= */
  @Roles('student', 'faculty', 'admin', 'college_admin')
  @Get('summary')
  async getSummary(@Request() req: any, @Query('studentId') studentId?: string) {
    const isAdmin = ['admin', 'college_admin'].includes(req.user.role);
    const id = isAdmin && studentId ? studentId : req.user.sub;
    return ok(await this.service.getSummary(id));
  }

  // ─── Fees ─────────────────────────────────────────────────────────────────────

  @Roles('student', 'faculty', 'admin', 'college_admin')
  @Get('fees')
  async getFees(@Request() req: any, @Query() q: FeeQueryDto) {
    const isAdmin = ['admin', 'college_admin'].includes(req.user.role);
    const result = await this.service.findFees(q, req.user.sub, isAdmin);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @Roles('admin', 'college_admin')
  @Post('fees')
  async createFee(@Body() body: CreateFeeDto) {
    return ok(await this.service.createFee(body));
  }

  @Roles('admin', 'college_admin')
  @Patch('fees/:id')
  async updateFee(@Param('id') id: string, @Body() body: any) {
    return ok(await this.service.updateFee(id, body));
  }

  @Roles('admin', 'college_admin')
  @Delete('fees/:id')
  async deleteFee(@Param('id') id: string) {
    return ok(await this.service.deleteFee(id));
  }

  @Roles('admin', 'college_admin')
  @Post('fees/bulk-monthly')
  async bulkMonthly(@Body() body: any) {
    return ok(await this.service.bulkCreateMonthlyFees(body));
  }

  // ─── Payments ─────────────────────────────────────────────────────────────────

  @Roles('student', 'faculty')
  @Post('pay')
  async payFee(@Request() req: any, @Body() body: PayFeeDto) {
    return ok(await this.service.payFee(body, req.user.sub));
  }

  @Roles('admin', 'college_admin')
  @Post('fees/:id/mark-paid')
  async markPaid(@Param('id') id: string, @Body('notes') notes?: string) {
    return ok(await this.service.adminMarkPaid(id, notes));
  }

  // ─── Transactions ─────────────────────────────────────────────────────────────

  @Roles('student', 'faculty', 'admin', 'college_admin')
  @Get('transactions')
  async getTransactions(@Request() req: any, @Query() q: TxnQueryDto) {
    const isAdmin = ['admin', 'college_admin'].includes(req.user.role);
    const result = await this.service.findTransactions(q, req.user.sub, isAdmin);
    return ok(result.items, { total: result.total, limit: result.limit, offset: result.offset });
  }

  @Roles('student', 'faculty', 'admin', 'college_admin')
  @Get('transactions/:id')
  async getTransaction(@Param('id') id: string, @Request() req: any) {
    const isAdmin = ['admin', 'college_admin'].includes(req.user.role);
    return ok(await this.service.getTransactionById(id, req.user.sub, isAdmin));
  }
}
