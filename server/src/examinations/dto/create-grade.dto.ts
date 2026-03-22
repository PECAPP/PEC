import { IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateGradeDto {
  @IsString()
  studentId: string;

  @IsString()
  courseId: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  midterm?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  final?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  total?: number;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}
