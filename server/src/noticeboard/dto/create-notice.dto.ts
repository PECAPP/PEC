import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';

class NoticeMediaDto {
  @IsString()
  @MinLength(1)
  url!: string;

  @IsString()
  @IsIn(['image', 'audio', 'video', 'file'])
  kind!: 'image' | 'audio' | 'video' | 'file';

  @IsOptional()
  @IsString()
  @MaxLength(200)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  mimeType?: string;

  @IsOptional()
  sizeBytes?: number;
}

export class CreateNoticeDto {
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(5000)
  content!: string;

  @IsOptional()
  @IsString()
  @IsIn(['news', 'update', 'event', 'alert'])
  category?: 'news' | 'update' | 'event' | 'alert';

  @IsOptional()
  @IsBoolean()
  important?: boolean;

  @IsOptional()
  @IsBoolean()
  pinned?: boolean;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoticeMediaDto)
  media?: NoticeMediaDto[];
}
