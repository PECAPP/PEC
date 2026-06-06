import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpsertFeatureFlagDto {
  @IsBoolean()
  enabled!: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  description?: string;

  @IsOptional()
  @IsString()
  payload?: string;
}
