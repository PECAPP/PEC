export class CreateFeeDto {
  studentId: string;
  amount: number;
  description: string;
  category: string; // college | mess | hostel | library | exam | other
  dueDate: string;
  semester?: string;
  month?: string;
}
