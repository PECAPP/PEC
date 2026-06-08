import { createZodDto } from 'nestjs-zod';
import { canteenOrderSchema } from '@pec/shared';

export class CreateCanteenOrderDto extends createZodDto(canteenOrderSchema) {}
