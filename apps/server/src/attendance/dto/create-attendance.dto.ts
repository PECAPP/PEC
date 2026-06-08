import { createZodDto } from 'nestjs-zod';
import { attendanceSchema } from '@pec/shared';

export class CreateAttendanceDto extends createZodDto(attendanceSchema) {}
