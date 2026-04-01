import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { attendanceSchema } from '@shared/schemas/erp';

// Plain class for NestJS/Swagger compatibility
// Runtime validation still uses the shared Zod schema (attendanceSchema)
export class CreateAttendanceDto {
  @ApiProperty({ example: 'uuid-student-id', description: 'Student UUID' })
  studentId: string;

  @ApiProperty({ example: 'course-uuid-or-id', description: 'Course ID or subject code' })
  subject: string;

  @ApiProperty({ example: '2024-03-31', description: 'Date in YYYY-MM-DD format' })
  date: string;

  @ApiProperty({ enum: ['present', 'absent', 'late'] })
  status: 'present' | 'absent' | 'late';

  @ApiPropertyOptional({ example: 'Medical leave' })
  remarks?: string;

  @ApiPropertyOptional({ example: 30.7673, description: 'Latitude for geofencing' })
  lat?: number;

  @ApiPropertyOptional({ example: 76.7865, description: 'Longitude for geofencing' })
  lng?: number;

  // Zod runtime validator available for services to call directly
  static validate(data: unknown): ReturnType<typeof attendanceSchema.parse> {
    return attendanceSchema.parse(data);
  }
}
