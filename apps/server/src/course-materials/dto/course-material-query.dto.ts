import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CourseMaterialQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  uploadedBy?: string;

  @IsOptional()
  @IsIn(['lecture-notes', 'reference', 'assignment', 'video', 'other'])
  type?: 'lecture-notes' | 'reference' | 'assignment' | 'video' | 'other';

  @IsOptional()
  @IsIn(['uploadedAt', 'createdAt', 'courseCode', 'title'])
  sortBy?: 'uploadedAt' | 'createdAt' | 'courseCode' | 'title';
}
