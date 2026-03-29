import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class CampusMapQueryDto extends PaginationQueryDto {
  @IsOptional()
  organizationId?: string | string[];

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['createdAt', 'updatedAt', 'name'])
  sortBy?: 'createdAt' | 'updatedAt' | 'name';
}
