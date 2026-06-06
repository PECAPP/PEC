import { IsOptional, IsString, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class RoomQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsString()
  building?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @Type(() => Number)
  floor?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
