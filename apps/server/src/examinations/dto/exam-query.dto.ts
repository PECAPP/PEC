import { Transform } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class ExamQueryDto {
  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(1)
  limit?: number;

  @IsOptional()
  @Transform(({ value }) => (value !== undefined ? Number(value) : undefined))
  @IsInt()
  @Min(0)
  offset?: number;

  @IsOptional()
  @IsString()
  courseId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined) return undefined;
    if (typeof value === 'boolean') return value;
    const normalized = String(value).toLowerCase().trim();
    return normalized === 'true' || normalized === '1';
  })
  upcoming?: boolean;
}
