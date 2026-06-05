import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class MessagingService {
  constructor(@Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy) {}

  async emitAttendanceCreated(payload: any) {
    try {
      // use event emit so that consumers can subscribe
      await this.client.emit('attendance.created', payload).toPromise();
    } catch (e) {
      console.error('Failed to emit attendance.created event', e?.message || e);
    }
  }
}
