import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const courseQuerySchema = z.object({
  department: z.string().optional(),
  facultyId: z.string().optional(),
  semester: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  status: z.string().optional(),
  sortBy: z.string().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
});



export class CourseQueryDto extends createZodDto(courseQuerySchema) {
}
