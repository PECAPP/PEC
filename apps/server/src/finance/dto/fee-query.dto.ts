import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const feeQuerySchema = z.object({
  studentId: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  semester: z.string().optional(),
  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
});



export class FeeQueryDto extends createZodDto(feeQuerySchema) {
}
