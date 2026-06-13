import { Module } from '@nestjs/common';
import { FinanceController } from './finance.controller';
import { FinanceService } from './finance.service';
import { FinanceRepository } from './finance.repository';
import { PdfModule } from '../pdf/pdf.module';
import { PAYMENT_GATEWAY } from './payment-gateway.interface';
import { MockPaymentGateway } from './mock-payment-gateway.service';

@Module({
  imports: [PdfModule],
  controllers: [FinanceController],
  providers: [
    FinanceService, 
    FinanceRepository,
    {
      provide: PAYMENT_GATEWAY,
      useClass: MockPaymentGateway,
    }
  ],
  exports: [FinanceService, PAYMENT_GATEWAY],
})
export class FinanceModule {}
