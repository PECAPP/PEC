import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const timetableQuerySchema = z.object({
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  department: z.string().optional(),
  semester: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  facultyId: z.string().optional(),
  courseId: z.string().optional(),
});

export class TimetableQueryDto extends createZodDto(timetableQuerySchema) {
}
