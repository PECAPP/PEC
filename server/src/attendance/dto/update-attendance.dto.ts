import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateAttendanceDto {
  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(['present', 'absent', 'late'])
  status?: 'present' | 'absent' | 'late';

  @IsOptional()
  @IsString()
  subject?: string;
}
