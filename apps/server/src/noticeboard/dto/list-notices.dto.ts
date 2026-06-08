import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const listNoticesSchema = z.object({
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  category: z.any().optional(),
  priorityLevel: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
});



export class ListNoticesDto extends createZodDto(listNoticesSchema) {
}
