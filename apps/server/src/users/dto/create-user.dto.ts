import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { userSchema } from '@shared/schemas/erp';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  fullName: string;

  @ApiProperty({ example: 'student@pec.edu' })
  email: string;

  @ApiProperty({ enum: ['student', 'faculty', 'college_admin', 'super_admin'], default: 'student' })
  role: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'], default: 'active' })
  status?: string;

  @ApiPropertyOptional({ example: 'Computer Science' })
  department?: string;

  @ApiPropertyOptional({ example: 'PEC12345' })
  enrollmentNumber?: string;

  @ApiPropertyOptional({ example: 4 })
  semester?: number;

  @ApiPropertyOptional({ example: 'FAC001' })
  employeeId?: string;

  @ApiPropertyOptional({ example: 'Associate Professor' })
  designation?: string;

  @ApiPropertyOptional({ example: 'Artificial Intelligence' })
  specialization?: string;

  @ApiPropertyOptional({ example: '+919876543210' })
  phone?: string;

  static validate(data: unknown) {
    return userSchema.parse(data);
  }
}

