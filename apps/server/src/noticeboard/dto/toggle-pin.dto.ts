import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const togglePinSchema = z.object({
  pinned: z.boolean(),
});



export class TogglePinDto extends createZodDto(togglePinSchema) {
}
