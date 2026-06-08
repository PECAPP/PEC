import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const updateCgpaEntrySchema = z.object({
  subjectName: z.string().optional(),
  courseId: z.string().uuid().optional(),
  courseCode: z.string().optional(),
  semester: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  credits: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  gradePoint: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  examDate: z.string().optional(),
  courseType: z.string().optional(),
  notes: z.string().optional(),
});



export class UpdateCgpaEntryDto extends createZodDto(updateCgpaEntrySchema) {
}
