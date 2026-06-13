import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const campusMapQuerySchema = z.object({
  category: z.string().optional(),
  organizationId: z.union([z.string(), z.array(z.string())]).optional(),
  sortBy: z.string().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
});



export class CampusMapQueryDto extends createZodDto(campusMapQuerySchema) {
}
