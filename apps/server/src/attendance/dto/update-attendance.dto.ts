import { createZodDto } from 'nestjs-zod';
import { attendanceSchema } from '@pec/shared';

export class UpdateAttendanceDto extends createZodDto(attendanceSchema.partial()) {}
