import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';

export class CreateRoomDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsBoolean()
  isGroup?: boolean;

  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];
}
