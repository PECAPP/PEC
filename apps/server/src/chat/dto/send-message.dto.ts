import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const sendMessageSchema = z.object({
  chatRoomId: z.string().uuid(),
  content: z.string(),
});



export class SendMessageDto extends createZodDto(sendMessageSchema) {
}
