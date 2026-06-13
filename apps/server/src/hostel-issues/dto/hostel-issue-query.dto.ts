import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const hostelIssueQuerySchema = z.object({  limit: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  offset: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  sortOrder: z.any().optional(),
  studentId: z.string().optional(),
  status: z.string().optional(),
  status__ne: z.string().optional(),
  category: z.string().optional(),
  priority: z.string().optional(),
  sortBy: z.string().optional(),
});



export class HostelIssueQueryDto extends createZodDto(hostelIssueQuerySchema) {
}
