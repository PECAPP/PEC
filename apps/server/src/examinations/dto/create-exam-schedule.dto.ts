import { ApiProperty } from '@nestjs/swagger';
import { examinationSchema } from '@shared/schemas/erp';

export class CreateExamScheduleDto {
  @ApiProperty({ example: 'uuid-course-id' })
  courseId: string;

  @ApiProperty({ enum: ['midterm', 'final', 'quiz', 'lab'], default: 'final' })
  examType: string;

  @ApiProperty({ example: '2024-05-15' })
  date: string;

  @ApiProperty({ example: '09:00' })
  startTime: string;

  @ApiProperty({ example: '12:00' })
  endTime: string;

  @ApiProperty({ example: 'Auditorium 1' })
  room: string;

  static validate(data: unknown) {
    return examinationSchema.parse(data);
  }
}

