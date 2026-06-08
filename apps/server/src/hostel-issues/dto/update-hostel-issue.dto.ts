import { createZodDto } from 'nestjs-zod';
import { hostelIssueSchema } from '@pec/shared';

export class UpdateHostelIssueDto extends createZodDto(hostelIssueSchema.partial()) {}
