import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateFeeRecordDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  amount?: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsIn(['tuition', 'hostel', 'exam', 'library', 'other'])
  category?: 'tuition' | 'hostel' | 'exam' | 'library' | 'other';

  @IsOptional()
  @IsIn(['pending', 'paid', 'overdue', 'pending_verification'])
  status?: 'pending' | 'paid' | 'overdue' | 'pending_verification';

  @IsOptional()
  @IsString()
  pendingTransactionId?: string | null;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string | null;

  @IsOptional()
  @IsString()
  paidDate?: string | null;

  @IsOptional()
  @IsString()
  verificationSubmittedAt?: string | null;

  @IsOptional()
  @IsString()
  lastPaymentAttempt?: string | null;
}
