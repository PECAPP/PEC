import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class UpdateCampusMapRoadDto {
  @IsOptional()
  @IsArray()
  points?: Array<{ x: number; y: number }>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  width?: number;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
