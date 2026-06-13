import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createRoomSchema = z.object({
  name: z.string(),
  type: z.string(),
  capacity: z.preprocess((a) => a === undefined ? 0 : parseInt(a as string, 10), z.number().int()),
  building: z.string(),
  floor: z.preprocess((a) => a === undefined ? 0 : parseInt(a as string, 10), z.number().int()),
  facilities: z.string().optional(),
  isAvailable: z.boolean().optional(),
});



export class CreateRoomDto extends createZodDto(createRoomSchema) {
}
