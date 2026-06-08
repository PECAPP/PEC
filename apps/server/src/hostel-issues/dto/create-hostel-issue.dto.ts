import { createZodDto } from 'nestjs-zod';
import { hostelIssueSchema } from '@pec/shared';

export class CreateHostelIssueDto extends createZodDto(hostelIssueSchema) {}
