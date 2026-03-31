import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { timetableSchema } from '@shared/schemas/erp';

export class CreateTimetableDto {
  @ApiPropertyOptional({ example: 'uuid-course-id' })
  courseId?: string;

  @ApiProperty({ example: 'Introduction to AI' })
  courseName: string;

  @ApiProperty({ example: 'CS101' })
  courseCode: string;

  @ApiPropertyOptional({ example: 'uuid-faculty-id' })
  facultyId?: string;

  @ApiPropertyOptional({ example: 'Dr. Jane Smith' })
  facultyName?: string;

  @ApiProperty({ enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] })
  day: string;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '10:00' })
  endTime: string;

  @ApiProperty({ example: 'Room 302' })
  room: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  department?: string;

  @ApiPropertyOptional({ example: 4 })
  semester?: number;

  @ApiPropertyOptional({ example: '2024-25' })
  batch?: string;

  static validate(data: unknown) {
    return timetableSchema.parse(data);
  }
}

