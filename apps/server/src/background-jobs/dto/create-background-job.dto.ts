import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createBackgroundJobSchema = z.object({
  type: z.string(),
  payload: z.string().optional(),
  dedupeKey: z.string().optional(),
  runAt: z.string().optional(),
  maxAttempts: z.number().int().optional(),
});



export class CreateBackgroundJobDto extends createZodDto(createBackgroundJobSchema) {
}
