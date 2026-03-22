import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Param,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateRoomDto } from './dto/create-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@UseGuards(AuthGuard, RolesGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Roles('student', 'faculty', 'college_admin')
  @Post('room')
  createRoom(@Request() req: any, @Body() body: CreateRoomDto) {
    // ensure requester is a participant
    const participants = Array.from(new Set([...body.userIds, req.user.sub]));
    return this.chatService.createRoom(
      body.name,
      body.isGroup ?? true,
      participants,
    );
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get('rooms')
  getRooms(@Request() req: any) {
    return this.chatService.getRoomsForUser(req.user.sub);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get('users')
  getChatUsers(@Request() req: any, @Query('q') q?: string) {
    return this.chatService.getChatUsers(req.user.sub, q);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get('room/:roomId/participants')
  getRoomParticipants(@Request() req: any, @Param('roomId') roomId: string) {
    return this.chatService.getRoomParticipants(roomId, req.user.sub);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Patch('room/:roomId')
  updateRoom(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Body() body: { name?: string },
  ) {
    return this.chatService.updateRoom(roomId, req.user.sub, body);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Post('room/:roomId/participants')
  addParticipant(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Body() body: { userId: string },
  ) {
    return this.chatService.addParticipant(roomId, req.user.sub, body.userId);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Delete('room/:roomId/participants/:userId')
  removeParticipant(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Param('userId') userId: string,
  ) {
    return this.chatService.removeParticipant(roomId, req.user.sub, userId);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Post('message')
  sendMessage(@Request() req: any, @Body() body: SendMessageDto) {
    return this.chatService.sendMessage(
      req.user.sub,
      body.chatRoomId,
      body.content,
    );
  }

  @Roles('student', 'faculty', 'college_admin')
  @Get('messages/:roomId')
  getMessages(
    @Request() req: any,
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit ? Number(limit) : undefined;
    return this.chatService.getMessages(roomId, req.user.sub, parsedLimit);
  }

  @Roles('student', 'faculty', 'college_admin')
  @Delete('message/:messageId')
  deleteMessage(@Request() req: any, @Param('messageId') messageId: string) {
    return this.chatService.deleteMessage(messageId, req.user.sub);
  }
}
