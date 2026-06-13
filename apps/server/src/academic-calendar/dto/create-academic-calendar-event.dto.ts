import { createZodDto } from 'nestjs-zod';
import { academicCalendarEventSchema } from '@pec/shared';

export class CreateAcademicCalendarEventDto extends createZodDto(academicCalendarEventSchema) {}

export class UpdateAcademicCalendarEventDto extends createZodDto(academicCalendarEventSchema.partial()) {}
