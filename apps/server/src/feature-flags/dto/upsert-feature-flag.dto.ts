import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const upsertFeatureFlagSchema = z.object({
  enabled: z.boolean(),
  description: z.string().optional(),
  payload: z.string().optional(),
});



export class UpsertFeatureFlagDto extends createZodDto(upsertFeatureFlagSchema) {
}
