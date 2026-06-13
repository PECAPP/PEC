import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const roomQuerySchema = z.object({
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  building: z.string().optional(),
  type: z.string().optional(),
  floor: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  isAvailable: z.preprocess((a) => a === undefined ? undefined : a === 'true', z.boolean().optional()),
});



export class RoomQueryDto extends createZodDto(roomQuerySchema) {
}
