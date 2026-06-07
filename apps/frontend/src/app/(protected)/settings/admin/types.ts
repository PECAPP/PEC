export type PaymentMethod = 'razorpay' | 'upi' | 'bank';

export interface PaymentConfig {
  method: PaymentMethod;
  razorpay?: {
    apiKey: string;
    apiSecret: string;
  };
  upi?: {
    upiId: string;
    upiName: string;
  };
  bank?: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    ifscCode: string;
    branch: string;
  };
  isActive: boolean;
  lastUpdated: any;
  updatedBy: string;
}
