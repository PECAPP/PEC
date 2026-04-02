import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @Type(() => Number)
  @IsNumber()
  capacity: number;

  @IsString()
  building: string;

  @Type(() => Number)
  @IsNumber()
  floor: number;

  @IsOptional()
  @IsString()
  facilities?: string;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}
