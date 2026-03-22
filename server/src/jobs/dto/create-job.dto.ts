import { Type } from 'class-transformer';
import { IsDateString, IsInt, IsOptional, IsString } from 'class-validator';

export class CreateJobDto {
  @IsString()
  title: string;

  @IsString()
  company: string;

  @IsString()
  location: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  salary?: string;

  @IsDateString()
  deadline: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  matchScore?: number;
}
