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

export class CreateCgpaEntryDto {
  @IsString()
  subjectName!: string;

  @IsOptional()
  @IsUUID('4')
  courseId?: string;

  @IsOptional()
  @IsString()
  courseCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  semester!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0.5)
  @Max(12)
  credits!: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  gradePoint!: number;

  @IsOptional()
  @IsDateString()
  examDate?: string;

  @IsOptional()
  @IsString()
  courseType?: string; // core | elective | minor | honors

  @IsOptional()
  @IsString()
  notes?: string;
}
