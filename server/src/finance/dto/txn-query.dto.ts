export class TxnQueryDto {
  studentId?: string;
  category?: string;
  status?: string;
  from?: string;  // ISO date
  to?: string;    // ISO date
  limit?: number;
  offset?: number;
}
