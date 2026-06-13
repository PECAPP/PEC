import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const cgpaEntryQuerySchema = z.object({
  userId: z.string().optional(),
  semester: z.string().optional(),
  sortBy: z.string().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
});



export class CgpaEntryQueryDto extends createZodDto(cgpaEntryQuerySchema) {
}

