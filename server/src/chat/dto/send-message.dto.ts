import { IsString, IsUUID, MaxLength, MinLength } from 'class-validator';

export class SendMessageDto {
  @IsUUID('4')
  chatRoomId: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  content: string;
}
