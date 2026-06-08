import { createZodDto } from 'nestjs-zod';
import { timetableSchema } from '@pec/shared';

export class UpdateTimetableDto extends createZodDto(timetableSchema.partial()) {}
