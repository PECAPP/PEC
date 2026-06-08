import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const listingQuerySchema = z.object({
  category: z.string().optional(),
  condition: z.string().optional(),
  minPrice: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  maxPrice: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.any().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
});



export class ListingQueryDto extends createZodDto(listingQuerySchema) {
}
