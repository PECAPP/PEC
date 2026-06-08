import { createZodDto } from 'nestjs-zod';
import { departmentSchema } from '@pec/shared';

export class CreateDepartmentDto extends createZodDto(departmentSchema) {}
