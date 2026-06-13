import { createZodDto } from 'nestjs-zod';
import { canteenOrderSchema } from '@pec/shared';

import { z } from 'zod';

export class UpdateCanteenOrderDto extends createZodDto(canteenOrderSchema.extend({
  hostelRoom: z.string().optional()
}).partial()) {}
