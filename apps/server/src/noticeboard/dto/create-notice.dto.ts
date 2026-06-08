import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const noticeMediaSchema = z.object({
  url: z.string().min(1),
  kind: z.enum(['image', 'audio', 'video', 'file']),
  name: z.string().max(200).optional(),
  mimeType: z.string().max(120).optional(),
  sizeBytes: z.number().optional(),
});

export const createNoticeSchema = z.object({
  title: z.string(),
  content: z.string(),
  category: z.string().optional(),
  important: z.boolean().optional(),
  priorityLevel: z.preprocess((a) => a === undefined ? undefined : parseInt(a as string, 10), z.number().int().optional()),
  pinned: z.boolean().optional(),
  media: z.array(noticeMediaSchema).optional(),
});

export class NoticeMediaDto extends createZodDto(noticeMediaSchema) {}
export class CreateNoticeDto extends createZodDto(createNoticeSchema) {}
