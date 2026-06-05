import { IsString, IsOptional, IsNumber, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePublicationDto {
  @IsString()
  facultyId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  journal?: string;

  @IsOptional()
  @IsString()
  conference?: string;

  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  doi?: string;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  abstract?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  citations?: number;

  @IsOptional()
  @IsString()
  coAuthors?: string;
}

export class CreateAwardDto {
  @IsString()
  facultyId: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  awardedBy?: string;

  @Type(() => Number)
  @IsNumber()
  year: number;

  @IsOptional()
  @IsString()
  category?: string;
}

export class CreateConferenceDto {
  @IsString()
  facultyId: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @IsString()
  presentationTitle?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateConsultationDto {
  @IsString()
  facultyId: string;

  @IsString()
  organization: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
