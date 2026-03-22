import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateFeeRecordDto {
  @IsString()
  studentId!: string;

  @IsNumber()
  @Min(1)
  amount!: number;

  @IsString()
  description!: string;

  @IsString()
  dueDate!: string;

  @IsIn(['tuition', 'hostel', 'exam', 'library', 'other'])
  category!: 'tuition' | 'hostel' | 'exam' | 'library' | 'other';

  @IsOptional()
  @IsIn(['pending', 'paid', 'overdue', 'pending_verification'])
  status?: 'pending' | 'paid' | 'overdue' | 'pending_verification';

  @IsOptional()
  @IsString()
  pendingTransactionId?: string;

  @IsOptional()
  @IsString()
  paymentTransactionId?: string;
}
