export interface PaymentGatewayResponse {
  success: boolean;
  transactionId: string;
  method: string;
  error?: string;
}

export interface PaymentGatewayProvider {
  processPayment(
    amount: number,
    currency: string,
    metadata: Record<string, any>
  ): Promise<PaymentGatewayResponse>;
}

export const PAYMENT_GATEWAY = 'PAYMENT_GATEWAY';
