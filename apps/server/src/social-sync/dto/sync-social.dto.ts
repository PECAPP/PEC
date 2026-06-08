import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const syncSocialSchema = z.object({
  githubUsername: z.string().optional(),
  linkedinUsername: z.string().optional(),
});



export class SyncSocialDto extends createZodDto(syncSocialSchema) {
}
