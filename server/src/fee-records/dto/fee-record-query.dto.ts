import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class FeeRecordQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['pending', 'paid', 'overdue', 'pending_verification'])
  status?: 'pending' | 'paid' | 'overdue' | 'pending_verification';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  minAmount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxAmount?: number;
}
