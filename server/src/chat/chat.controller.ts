import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import {
  IsArray,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateClubDto {
  @IsString()
  @MinLength(2)
  name!: string;
}

class PostClubMessageDto {
  @IsString()
  @MinLength(1)
  content!: string;
}

class ClubJoinMediaDto {
  @IsString()
  url!: string;

  @IsString()
  @IsIn(['image', 'audio', 'video', 'file'])
  kind!: 'image' | 'audio' | 'video' | 'file';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

class ClubJoinRequestDto {
  @IsString()
  @MinLength(10)
  proposalText!: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClubJoinMediaDto)
  media?: ClubJoinMediaDto[];
}

class ClubJoinRequestDecisionDto {
  @IsString()
  @IsIn(['approve', 'reject'])
  action!: 'approve' | 'reject';

  @IsOptional()
  @IsString()
  reviewNote?: string;
}

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async findAll(@Request() req: any) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];
    const data = await this.chatService.findAllRooms(req.user.sub, userRoles);
    return { success: true, data };
  }

  @Get('messages/:roomId')
  async findMessages(
    @Request() req: any,
    @Param('roomId', new ParseUUIDPipe({ version: '4' })) roomId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const data = await this.chatService.findMessages(
      roomId,
      req.user.sub,
      limit,
    );
    return { success: true, data };
  }

  @Get('users')
  async getChatUsers(@Query('q') query: string) {
    const data = await this.chatService.getChatUsers(query);
    return { success: true, data };
  }

  @Post('room')
  async createRoom(@Request() req: any, @Body() createRoomDto: CreateRoomDto) {
    const data = await this.chatService.createRoom(createRoomDto, req.user.sub);
    return { success: true, data };
  }

  @Post('message')
  async sendMessage(
    @Request() req: any,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const data = await this.chatService.sendMessage(
      sendMessageDto,
      req.user.sub,
    );
    return { success: true, data };
  }

  @Delete('message/:id')
  async removeMessage(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
  ) {
    const data = await this.chatService.deleteMessage(id, req.user.sub);
    return { success: true, data };
  }

  @Get('clubs')
  async listClubs(@Request() req: any) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.listClubs(req.user.sub, userRoles);
    return { success: true, data };
  }

  @Post('clubs')
  async createClub(@Request() req: any, @Body() body: CreateClubDto) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.createClub(
      body.name,
      req.user.sub,
      userRoles,
    );
    return { success: true, data };
  }

  @Post('clubs/:id/join-request')
  async submitClubJoinRequest(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: ClubJoinRequestDto,
  ) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.submitClubJoinRequest(
      id,
      req.user.sub,
      body.proposalText,
      body.media ?? [],
      userRoles,
    );
    return { success: true, data };
  }

  @Get('clubs/requests')
  async listClubJoinRequests(@Request() req: any) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.listClubJoinRequests(
      req.user.sub,
      userRoles,
    );
    return { success: true, data };
  }

  @Patch('clubs/requests/:requestId')
  async reviewClubJoinRequest(
    @Request() req: any,
    @Param('requestId', new ParseUUIDPipe({ version: '4' })) requestId: string,
    @Body() body: ClubJoinRequestDecisionDto,
  ) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.reviewClubJoinRequest(
      requestId,
      req.user.sub,
      body.action,
      body.reviewNote,
      userRoles,
    );
    return { success: true, data };
  }

  @Post('clubs/:id/post')
  async postToClub(
    @Request() req: any,
    @Param('id', new ParseUUIDPipe({ version: '4' })) id: string,
    @Body() body: PostClubMessageDto,
  ) {
    const userRoles = Array.isArray(req.user?.roles)
      ? req.user.roles
      : req.user?.role
        ? [req.user.role]
        : [];

    const data = await this.chatService.postToClub(
      id,
      req.user.sub,
      body.content,
      userRoles,
    );
    return { success: true, data };
  }
}
