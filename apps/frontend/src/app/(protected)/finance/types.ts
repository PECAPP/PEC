export interface FeeRecord {
  id: string;
  studentId: string;
  description: string;
  category: string;
  amount: number;
  lateFeeAmount: number;
  lateFeeApplied: boolean;
  dueDate: string;
  status: string;
  semester?: string;
  month?: string;
  paidDate?: string;
  paymentTransactionId?: string;
  student?: { id: string; name: string; email: string };
  transactions?: Transaction[];
}

export interface Transaction {
  id: string;
  studentId: string;
  feeRecordId: string;
  amount: number;
  paymentMethod: string;
  status: string;
  gatewayTxnId?: string;
  receiptNo: string;
  notes?: string;
  createdAt: string;
  feeRecord?: { category: string; description: string; semester?: string; month?: string };
  student?: {
    id: string;
    name: string;
    email: string;
    studentProfile?: { enrollmentNumber?: string; department?: string };
  };
}

export interface Summary {
  totalPending: number;
  totalPaid: number;
  overdue: number;
  byCategory: Record<string, { pending: number; paid: number }>;
}
