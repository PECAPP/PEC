import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const enrollmentQuerySchema = z.object({  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  studentId: z.string().optional(),
  courseId: z.string().optional(),
  status: z.string().optional(),
  semester: z.number().int().optional(),
});



export class EnrollmentQueryDto extends createZodDto(enrollmentQuerySchema) {
}
