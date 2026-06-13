import { createZodDto } from 'nestjs-zod';
import { departmentSchema } from '@pec/shared';

import { z } from 'zod';

export class UpdateDepartmentDto extends createZodDto(departmentSchema.extend({
  timetableLabel: z.string().optional(),
}).partial()) {}
