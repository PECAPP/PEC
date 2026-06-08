import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const createWaiverRequestSchema = z.object({
  courseId: z.string().optional(),
  courseCode: z.string().optional(),
  courseName: z.string().optional(),
  fromDate: z.string(),
  toDate: z.string(),
  reason: z.string(),
  supportingDocUrl: z.string().url().optional(),
});



export class CreateWaiverRequestDto extends createZodDto(createWaiverRequestSchema) {
}
