import { IsOptional, IsString } from 'class-validator';

export class CreateHostelIssueDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsString()
  priority: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsString()
  roomNumber: string;

  @IsOptional()
  @IsString()
  studentId?: string;

  @IsString()
  studentName: string;

  @IsOptional()
  @IsString()
  organizationId?: string;

  @IsOptional()
  responses?: unknown;

  @IsOptional()
  createdAt?: string;

  @IsOptional()
  updatedAt?: string;
}
