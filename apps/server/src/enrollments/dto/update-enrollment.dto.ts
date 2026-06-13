import { createZodDto } from 'nestjs-zod';
import { enrollmentSchema } from '@pec/shared';

export class UpdateEnrollmentDto extends createZodDto(enrollmentSchema.partial()) {}
