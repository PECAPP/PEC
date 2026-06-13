import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createRoomSchema = z.object({
  name: z.string(),
  isGroup: z.boolean().optional(),
  userIds: z.array(z.any()),
});



export class CreateRoomDto extends createZodDto(createRoomSchema) {
}
