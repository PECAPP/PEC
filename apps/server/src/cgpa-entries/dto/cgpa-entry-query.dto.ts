import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CgpaEntryQueryDto extends PaginationQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester?: number;

  @IsOptional()
  @IsUUID('4')
  userId?: string;

  @IsOptional()
  @IsIn(['createdAt', 'semester', 'subjectName'])
  sortBy?: 'createdAt' | 'semester' | 'subjectName';
}

