import { Type } from 'class-transformer';
import {
  IsDateString,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';

export class AttendanceQueryDto extends PaginationQueryDto {
  @IsOptional()
  @IsUUID('4')
  studentId?: string;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsIn(['present', 'absent', 'late'])
  status?: 'present' | 'absent' | 'late';
}
