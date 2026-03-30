import { IsIn, IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class NightCanteenItemQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsIn(['true', 'false'])
  isAvailable?: 'true' | 'false';

  @IsOptional()
  @IsIn(['name', 'price', 'updatedAt', 'createdAt'])
  sortBy?: 'name' | 'price' | 'updatedAt' | 'createdAt';
}

export class NightCanteenOrderQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  studentId?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsIn(['timestamp', 'status', 'totalAmount', 'updatedAt'])
  sortBy?: 'timestamp' | 'status' | 'totalAmount' | 'updatedAt';
}
