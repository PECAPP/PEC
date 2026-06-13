import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const attendanceQuerySchema = z.object({
  studentId: z.string().optional(),
  courseId: z.string().optional(),
  subject: z.string().optional(),
  status: z.string().optional(),
  date: z.string().optional(),
  sortBy: z.string().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
});



export class AttendanceQueryDto extends createZodDto(attendanceQuerySchema) {
}
