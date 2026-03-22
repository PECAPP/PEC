import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class EnrollmentQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @IsOptional()
  @IsUUID('4')
  courseId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester?: number;
}
