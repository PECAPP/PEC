import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateBackgroundJobDto {
  @IsString()
  @MaxLength(120)
  type!: string;

  @IsOptional()
  @IsString()
  payload?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  dedupeKey?: string;

  @IsOptional()
  @IsDateString()
  runAt?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxAttempts?: number;
}
