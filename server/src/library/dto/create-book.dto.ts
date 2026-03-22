import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateBookDto {
  @IsString()
  title: string;

  @IsString()
  author: string;

  @IsString()
  isbn: string;

  @IsString()
  category: string;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  totalCopies: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  availableCopies: number;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  year?: number;
}
