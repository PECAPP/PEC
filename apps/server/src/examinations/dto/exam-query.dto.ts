import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const examQuerySchema = z.object({
  limit: z.number().int().optional(),
  offset: z.number().int().optional(),
  courseId: z.string().optional(),
  department: z.string().optional(),
  upcoming: z.boolean().optional(),
});



export class ExamQueryDto extends createZodDto(examQuerySchema) {
}
