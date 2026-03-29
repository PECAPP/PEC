import { IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateCampusMapRegionDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  x: number;

  @IsNumber()
  y: number;

  @IsNumber()
  @Min(0)
  width: number;

  @IsNumber()
  @Min(0)
  height: number;

  @IsString()
  category: string;

  @IsOptional()
  @IsString()
  link?: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}
