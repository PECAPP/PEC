import { createZodDto } from 'nestjs-zod';
import { enrollmentSchema } from '@pec/shared';

export class CreateEnrollmentDto extends createZodDto(enrollmentSchema) {}
