import { Injectable, Inject, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  constructor(@Inject('RMQ_SERVICE') private client: ClientProxy) {}

  async onModuleInit() {
    await this.client.connect();
    console.log('[QueueService] Connected to RabbitMQ');
  }

  async addSendEmailJob(payload: any) {
    try {
      await this.client.emit('send-email', payload).toPromise();
    } catch (e) {
      console.error('Failed to emit send-email job', e?.message || e);
    }
  }

  async addJob(name: string, payload: any, opts: any = {}) {
    try {
      await this.client.emit(name, payload).toPromise();
    } catch (e) {
      console.error(`Failed to emit ${name} job`, e?.message || e);
    }
  }

  async onModuleDestroy() {
    this.client.close();
  }
}

