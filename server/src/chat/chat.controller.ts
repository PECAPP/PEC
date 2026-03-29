import {
  Controller,
  Get,
  Post,
  Delete,
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

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  async findAll(@Request() req: any) {
    const data = await this.chatService.findAllRooms(req.user.sub);
    return { success: true, data };
  }

  @Get('messages/:roomId')
  async findMessages(
    @Request() req: any,
    @Param('roomId', new ParseUUIDPipe({ version: '4' })) roomId: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
  ) {
    const data = await this.chatService.findMessages(roomId, req.user.sub, limit);
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
  async sendMessage(@Request() req: any, @Body() sendMessageDto: SendMessageDto) {
    const data = await this.chatService.sendMessage(sendMessageDto, req.user.sub);
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
}
