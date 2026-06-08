import { createZodDto } from 'nestjs-zod';
import { canteenOrderSchema } from '@pec/shared';

export class UpdateCanteenOrderDto extends createZodDto(canteenOrderSchema.partial()) {}
