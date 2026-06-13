import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const updateNoticeSchema = z.object({
  title: z.string().min(5).max(120).optional(),
  content: z.string().min(10).max(10000).optional(),
  category: z.enum(['academic', 'administrative', 'event', 'urgent', 'update', 'student_life']).optional(),
  important: z.boolean().optional(),
  priorityLevel: z.number().min(1).max(5).optional(),
  pinned: z.boolean().optional(),
  mediaJson: z.string().optional(),
});

export class UpdateNoticeDto extends createZodDto(updateNoticeSchema) {}
