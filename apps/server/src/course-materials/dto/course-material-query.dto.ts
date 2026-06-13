import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const courseMaterialQuerySchema = z.object({  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  courseId: z.string().optional(),
  uploadedBy: z.string().optional(),
  type: z.string().optional(),
  sortBy: z.string().optional(),
});



export class CourseMaterialQueryDto extends createZodDto(courseMaterialQuerySchema) {
}
