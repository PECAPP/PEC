import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const nightCanteenItemQuerySchema = z.object({  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  category: z.string().optional(),
  isAvailable: z.boolean().optional(),
  sortBy: z.string().optional(),
});



export class NightCanteenItemQueryDto extends createZodDto(nightCanteenItemQuerySchema) {
}
export const nightCanteenOrderQuerySchema = z.object({
  studentId: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.any().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
});



export class NightCanteenOrderQueryDto extends createZodDto(nightCanteenOrderQuerySchema) {
}
