import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';

export class CreateWaiverRequestDto {
  @ApiPropertyOptional({ description: 'Course UUID (optional for general waiver)' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  courseId?: string;

  @ApiPropertyOptional({ description: 'Course code for display snapshot', example: 'DS101' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  courseCode?: string;

  @ApiPropertyOptional({ description: 'Course name for display snapshot' })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  courseName?: string;

  @ApiProperty({ description: 'Waiver start date', example: '2026-04-04' })
  @IsDateString()
  fromDate: string;

  @ApiProperty({ description: 'Waiver end date', example: '2026-04-06' })
  @IsDateString()
  toDate: string;

  @ApiProperty({ description: 'Reason for waiver request' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  reason: string;

  @ApiPropertyOptional({ description: 'Supporting document URL' })
  @IsOptional()
  @IsUrl()
  supportingDocUrl?: string;
}
