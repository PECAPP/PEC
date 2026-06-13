import { createZodDto } from 'nestjs-zod';
import { timetableSchema } from '@pec/shared';

export class CreateTimetableDto extends createZodDto(timetableSchema) {}
