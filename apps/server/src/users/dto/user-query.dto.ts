import { Type } from 'class-transformer';
import { IsOptional, IsString, IsEnum, Min, Max } from 'class-validator';

export enum UserRole {
  ADMIN = 'admin',
  FACULTY = 'faculty',
  STUDENT = 'student',
  STAFF = 'staff',
}

export class UserQueryDto {
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(8)
  semester?: number;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(200)
  limit?: number = 100;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  status?: 'active' | 'inactive' | 'suspended';
}
