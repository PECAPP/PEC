import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateEnrollmentDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;
}
