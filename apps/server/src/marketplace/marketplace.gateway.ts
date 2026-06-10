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
import { Logger, UseGuards } from '@nestjs/common';
import { WsAuthGuard } from '../auth/ws-auth.guard';

@WebSocketGateway({
  namespace: 'marketplace-chat',
  cors: {
    origin: '*',
  },
})
export class MarketplaceGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MarketplaceGateway.name);
  private userSockets = new Map<string, string>(); // userId -> socketId

  constructor() {}

  async handleConnection(client: Socket) {
    this.logger.log(`Client connected to marketplace-chat: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from marketplace-chat: ${client.id}`);
    for (const [userId, socketId] of this.userSockets.entries()) {
      if (socketId === client.id) {
        this.userSockets.delete(userId);
        // Optional: emit user offline presence
        break;
      }
    }
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('joinChat')
  handleJoinChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (user) {
      this.userSockets.set(user.id, client.id);
    }
    client.join(`chat_${chatId}`);
    this.logger.log(`Client ${client.id} joined chat ${chatId}`);
    return { event: 'joinedChat', chatId };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('leaveChat')
  handleLeaveChat(
    @MessageBody() chatId: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.leave(`chat_${chatId}`);
    this.logger.log(`Client ${client.id} left chat ${chatId}`);
    return { event: 'leftChat', chatId };
  }

  @UseGuards(WsAuthGuard)
  @SubscribeMessage('typing')
  handleTyping(
    @MessageBody() payload: { chatId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    
    client.to(`chat_${payload.chatId}`).emit('typing', {
      chatId: payload.chatId,
      userId: user.id,
      isTyping: payload.isTyping
    });
  }

  // Real-time message broadcast is usually triggered by the controller/service
  // when a message is successfully saved to DB.
  // We provide a method here that the service can call.
  broadcastMessage(chatId: string, message: any) {
    this.server.to(`chat_${chatId}`).emit('newMessage', message);
  }

  // Broadcast read receipts
  @UseGuards(WsAuthGuard)
  @SubscribeMessage('markRead')
  handleMarkRead(
    @MessageBody() payload: { chatId: string; messageId: string },
    @ConnectedSocket() client: Socket,
  ) {
    const user = (client as any).user;
    if (!user) return;
    
    // In a real system, we would update the DB. For now, just emit the event.
    this.server.to(`chat_${payload.chatId}`).emit('messageRead', {
      chatId: payload.chatId,
      messageId: payload.messageId,
      userId: user.id,
      timestamp: new Date()
    });
  }
}
