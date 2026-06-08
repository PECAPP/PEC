import { createZodDto } from 'nestjs-zod';
import { courseSchema } from '@pec/shared';

export class CreateCourseDto extends createZodDto(courseSchema) {}
