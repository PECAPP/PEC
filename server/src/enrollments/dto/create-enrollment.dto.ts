import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { enrollmentSchema } from '@shared/schemas/erp';

export class CreateEnrollmentDto {
  @ApiProperty({ example: 'uuid-student-id' })
  studentId: string;

  @ApiProperty({ example: 'uuid-course-id' })
  courseId: string;

  @ApiProperty({ example: 'Introduction to Computing' })
  courseName: string;

  @ApiProperty({ example: 'CS101' })
  courseCode: string;

  @ApiPropertyOptional({ example: 3 })
  semester?: number;

  @ApiPropertyOptional({ example: '2024-25' })
  batch?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'completed', 'withdrawn'], default: 'active' })
  status?: string;

  @ApiPropertyOptional()
  enrolledAt?: string;

  static validate(data: unknown): ReturnType<typeof enrollmentSchema.parse> {
    return enrollmentSchema.parse(data);
  }
}
