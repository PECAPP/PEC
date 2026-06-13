import { createZodDto } from 'nestjs-zod';
import { courseSchema } from '@pec/shared';

export class UpdateCourseDto extends createZodDto(courseSchema.partial()) {}
