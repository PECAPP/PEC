import { IsArray, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCampusMapRoadDto {
  @IsArray()
  points: Array<{ x: number; y: number }>;

  @IsNumber()
  @Min(0)
  width: number;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
