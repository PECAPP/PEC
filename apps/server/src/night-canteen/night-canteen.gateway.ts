import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/night-canteen',
})
@Injectable()
export class NightCanteenGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(NightCanteenGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connected to canteen: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected from canteen: ${client.id}`);
  }

  emitNewOrder(order: any) {
    this.server.emit('newOrder', order);
  }

  emitOrderUpdated(order: any) {
    this.server.emit('orderUpdated', order);
  }

  @SubscribeMessage('joinManager')
  handleJoinManager(client: Socket) {
    client.join('managers');
    this.logger.log(`Client ${client.id} joined managers room`);
    return { event: 'joined', data: 'managers' };
  }
}
