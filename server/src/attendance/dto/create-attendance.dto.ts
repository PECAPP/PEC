import { IsDateString, IsIn, IsString, IsUUID } from 'class-validator';

export class CreateAttendanceDto {
  @IsDateString()
  date: string;

  @IsIn(['present', 'absent', 'late'])
  status: 'present' | 'absent' | 'late';

  @IsString()
  subject: string;

  @IsUUID('4')
  studentId: string;
}
