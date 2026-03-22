import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  credits: number;

  @IsString()
  instructor: string;

  @IsString()
  department: string;

  @IsInt()
  @Min(1)
  semester: number;

  @IsString()
  status: string;

  @IsOptional()
  @IsUUID('4')
  id?: string;
}
