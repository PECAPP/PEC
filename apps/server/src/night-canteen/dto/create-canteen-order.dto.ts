import { createZodDto } from 'nestjs-zod';
import { canteenOrderSchema } from '@pec/shared';

import { z } from 'zod';

export class CreateCanteenOrderDto extends createZodDto(canteenOrderSchema.extend({
  studentName: z.string().optional(),
  hostelRoom: z.string().optional(),
  timestamp: z.any().optional(),
})) {}
