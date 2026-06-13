import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createCourseMaterialSchema = z.object({
  courseId: z.string(),
  courseName: z.string(),
  courseCode: z.string(),
  title: z.string(),
  description: z.string().optional(),
  fileURL: z.string(),
  type: z.any().optional(),
  uploadedBy: z.string(),
});



export class CreateCourseMaterialDto extends createZodDto(createCourseMaterialSchema) {
}
