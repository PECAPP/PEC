import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';
import { WsThrottlerGuard } from '../common/guards/ws-throttler.guard';

@UseGuards(WsThrottlerGuard)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(private readonly chatService: ChatService) {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    // Extract user from token in real implementation
    // For now, assume client handshakes with auth token
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomId);
    this.logger.log(`Client ${client.id} joined room ${roomId}`);
    return { event: 'joinedRoom', roomId };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leaveRoom')
  handleLeaveRoom(
    @MessageBody() roomId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(roomId);
    this.logger.log(`Client ${client.id} left room ${roomId}`);
    return { event: 'leftRoom', roomId };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('sendMessage')
  async handleMessage(
    @MessageBody() payload: { roomId: string; content: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;

    // Save message to DB
    const message = await this.chatService.createMessage(user.id, payload.roomId, payload.content);

    // Broadcast to everyone in the room
    this.server.to(payload.roomId).emit('newMessage', message);
    
    return message;
  }
}
