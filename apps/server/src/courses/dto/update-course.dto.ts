import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  credits?: number;

  @IsOptional()
  @IsString()
  instructor?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;

  @IsOptional()
  @IsString()
  status?: string;
}
