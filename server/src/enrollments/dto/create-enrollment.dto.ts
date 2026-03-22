import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateEnrollmentDto {
  @IsUUID('4')
  studentId: string;

  @IsUUID('4')
  courseId: string;

  @IsString()
  courseName: string;

  @IsString()
  courseCode: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;

  @IsOptional()
  @IsString()
  batch?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsDateString()
  enrolledAt?: string;
}
