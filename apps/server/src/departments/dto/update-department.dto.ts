import { createZodDto } from 'nestjs-zod';
import { departmentSchema } from '@pec/shared';

export class UpdateDepartmentDto extends createZodDto(departmentSchema.partial()) {}
