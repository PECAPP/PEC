import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { departmentSchema } from '@shared/schemas/erp';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Computer Science' })
  name: string;

  @ApiProperty({ example: 'CS' })
  code: string;

  @ApiPropertyOptional({ example: 'Dr. Smith' })
  hod?: string;

  @ApiPropertyOptional({ example: 'Core CS department' })
  description?: string;

  @ApiPropertyOptional({ example: 'active' })
  status?: string;

  @ApiPropertyOptional({ example: 'CS-TT' })
  timetableLabel?: string;

  static validate(data: unknown): ReturnType<typeof departmentSchema.parse> {
    return departmentSchema.parse(data);
  }
}
