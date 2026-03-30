import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class HostelIssueQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  status__ne?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  priority?: string;

  @IsOptional()
  organizationId?: string | string[];

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'priority', 'status'])
  sortBy?: 'createdAt' | 'updatedAt' | 'priority' | 'status';
}
