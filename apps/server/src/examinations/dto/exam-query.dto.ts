import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const examQuerySchema = z.object({
  limit: z.preprocess((a) => (a === undefined ? undefined : parseInt(a as string, 10)), z.number().int().optional()),
  offset: z.preprocess((a) => (a === undefined ? undefined : parseInt(a as string, 10)), z.number().int().optional()),
  courseId: z.string().optional(),
  department: z.string().optional(),
  examType: z.string().optional(),
  upcoming: z.preprocess((a) => (a === undefined ? undefined : a === 'true'), z.boolean().optional()),
});



export class ExamQueryDto extends createZodDto(examQuerySchema) {
}
