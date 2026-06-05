import { IsIn, IsOptional, IsString } from 'class-validator';

export class CreateCourseMaterialDto {
  @IsString()
  courseId: string;

  @IsString()
  courseName: string;

  @IsString()
  courseCode: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  fileURL: string;

  @IsOptional()
  @IsIn(['lecture-notes', 'reference', 'assignment', 'video', 'other'])
  type?: 'lecture-notes' | 'reference' | 'assignment' | 'video' | 'other';

  @IsString()
  uploadedBy: string;
}
