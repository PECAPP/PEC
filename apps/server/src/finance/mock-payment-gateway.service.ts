import { Injectable } from '@nestjs/common';
import { PaymentGatewayProvider, PaymentGatewayResponse } from './payment-gateway.interface';
import { randomUUID } from 'crypto';

@Injectable()
export class MockPaymentGateway implements PaymentGatewayProvider {
  async processPayment(
    amount: number,
    currency: string,
    metadata: Record<string, any>
  ): Promise<PaymentGatewayResponse> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate 95% success rate
    const isSuccess = Math.random() < 0.95;

    if (isSuccess) {
      return {
        success: true,
        transactionId: `SIM-${randomUUID()}`,
        method: 'online',
      };
    } else {
      return {
        success: false,
        transactionId: `SIM-${randomUUID()}`,
        method: 'online',
        error: 'Insufficient funds or bank timeout',
      };
    }
  }
}
