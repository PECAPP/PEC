import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateTimetableDto {
  @IsOptional()
  @IsUUID('4')
  courseId?: string;

  @IsString()
  courseName: string;

  @IsString()
  courseCode: string;

  @IsOptional()
  @IsUUID('4')
  facultyId?: string;

  @IsOptional()
  @IsString()
  facultyName?: string;

  @IsString()
  day: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsString()
  room: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  semester?: number;

  @IsOptional()
  @IsString()
  batch?: string;
}
