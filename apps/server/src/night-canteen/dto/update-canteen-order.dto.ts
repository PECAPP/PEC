import { Type } from 'class-transformer';
import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class CanteenOrderItemDto {
  @IsOptional()
  @IsString()
  itemId?: string;

  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  quantity: number;

  @IsNumber()
  @Min(0)
  price: number;
}

export class UpdateCanteenOrderDto {
  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  hostelRoom?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CanteenOrderItemDto)
  items?: CanteenOrderItemDto[];

  @IsOptional()
  @IsNumber()
  @Min(0)
  totalAmount?: number;
}
