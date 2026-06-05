export class PayFeeDto {
  feeRecordId: string;
  paymentMethod?: string; // online | cash | upi | neft | dd
  gatewayTxnId?: string;
  notes?: string;
}
