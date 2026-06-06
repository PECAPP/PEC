import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

export class UpdateCgpaEntryDto {
  @IsOptional()
  @IsString()
  subjectName?: string;

  @IsOptional()
  @IsUUID('4')
  courseId?: string;

  @IsOptional()
  @IsString()
  courseCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(12)
  credits?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  gradePoint?: number;

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsString()
  courseType?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
