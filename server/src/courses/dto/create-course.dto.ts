import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { courseSchema } from '@shared/schemas/erp';

export class CreateCourseDto {
  @ApiProperty({ example: 'CS101' })
  code: string;

  @ApiProperty({ example: 'Introduction to AI' })
  name: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 20 })
  credits: number;

  @ApiPropertyOptional({ example: 'Dr. Jane Smith' })
  instructor?: string;

  @ApiPropertyOptional({ example: 'uuid-instructor-id' })
  instructorId?: string;

  @ApiProperty({ example: 'Computer Science' })
  department: string;

  @ApiProperty({ example: 4, minimum: 1, maximum: 8 })
  semester: number;

  @ApiProperty({ enum: ['active', 'inactive', 'archived'], default: 'active' })
  status: string;

  @ApiPropertyOptional()
  id?: string;

  static validate(data: unknown) {
    return courseSchema.parse(data);
  }
}

