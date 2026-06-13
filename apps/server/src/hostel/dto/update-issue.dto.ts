import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const issueResponseSchema = z.object({
  message: z.string().max(1000),
  authorId: z.string().max(100),
  authorRole: z.string().max(100).optional(),
  timestamp: z.string().optional(),
});

const updateHostelIssueSchema = z.object({
  status: z.string().max(100).optional(),
  responses: z.array(issueResponseSchema).optional(),
});

export class IssueResponseDto extends createZodDto(issueResponseSchema) {}
export class UpdateHostelIssueDto extends createZodDto(updateHostelIssueSchema) {}
