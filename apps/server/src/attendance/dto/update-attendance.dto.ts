import { ApiPropertyOptional } from '@nestjs/swagger';
import { attendanceSchema } from '@shared/schemas/erp';

export class UpdateAttendanceDto {
  @ApiPropertyOptional({ enum: ['present', 'absent', 'late'] })
  status?: 'present' | 'absent' | 'late';

  @ApiPropertyOptional()
  date?: string | Date;

  @ApiPropertyOptional()
  remarks?: string;

  static validate(data: unknown): Partial<ReturnType<typeof attendanceSchema.parse>> {
    return attendanceSchema.partial().parse(data);
  }
}
