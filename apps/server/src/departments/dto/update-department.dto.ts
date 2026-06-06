import { ApiPropertyOptional } from '@nestjs/swagger';
import { departmentSchema } from '@shared/schemas/erp';

export class UpdateDepartmentDto {
  @ApiPropertyOptional() name?: string;
  @ApiPropertyOptional() code?: string;
  @ApiPropertyOptional() hod?: string;
  @ApiPropertyOptional() description?: string;
  @ApiPropertyOptional() status?: string;
  @ApiPropertyOptional() timetableLabel?: string;

  static validate(data: unknown): Partial<ReturnType<typeof departmentSchema.parse>> {
    return departmentSchema.partial().parse(data);
  }
}
