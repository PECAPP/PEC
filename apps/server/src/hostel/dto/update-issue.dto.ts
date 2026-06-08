import { IsOptional, IsString, MaxLength, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class IssueResponseDto {
  @IsString()
  @MaxLength(1000)
  message: string;

  @IsString()
  @MaxLength(100)
  authorId: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  authorRole?: string;
  
  @IsString()
  @IsOptional()
  timestamp?: string;
}

export class UpdateHostelIssueDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  status?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => IssueResponseDto)
  responses?: IssueResponseDto[];
}
