import { IsDateString, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateAssignmentDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString()
  dueDate: string;

  @IsUUID('4')
  courseId: string;
}
