import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';

@Injectable()
export class DlqService {
  private readonly logger = new Logger(DlqService.name);
  private readonly rabbitMqApiUrl: string;
  private readonly rabbitMqAuth: string;

  constructor() {
    const host = process.env.RABBITMQ_HOST || 'localhost';
    const user = process.env.RABBITMQ_USER || 'guest';
    const pass = process.env.RABBITMQ_PASS || 'guest';
    this.rabbitMqApiUrl = `http://${host}:15672/api`;
    this.rabbitMqAuth = Buffer.from(`${user}:${pass}`).toString('base64');
  }

  async getDeadLetterMessages(queueName: string = 'pec_dlq', count: number = 10) {
    try {
      const response = await fetch(`${this.rabbitMqApiUrl}/queues/%2F/${queueName}/get`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.rabbitMqAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count,
          ackmode: 'ack_requeue_true', // Peek without consuming
          encoding: 'auto',
        }),
      });
      
      if (!response.ok) {
        throw new Error(`RabbitMQ API returned status ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      this.logger.error(`Error fetching DLQ messages from ${queueName}`, error.message);
      throw new HttpException('Failed to fetch DLQ messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async replayMessages(queueName: string = 'pec_dlq', targetExchange: string = 'pec_exchange', routingKey: string = '') {
    try {
      // 1. Consume messages from DLQ
      const getResponse = await fetch(`${this.rabbitMqApiUrl}/queues/%2F/${queueName}/get`, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${this.rabbitMqAuth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          count: 100,
          ackmode: 'ack_requeue_false', // Consume!
          encoding: 'auto',
        }),
      });

      if (!getResponse.ok) {
        throw new Error(`RabbitMQ API returned status ${getResponse.status}`);
      }
      
      const messages = await getResponse.json();
      let replayed = 0;

      // 2. Publish back to target exchange
      for (const msg of messages) {
        const pubResponse = await fetch(`${this.rabbitMqApiUrl}/exchanges/%2F/${targetExchange}/publish`, {
          method: 'POST',
          headers: {
            Authorization: `Basic ${this.rabbitMqAuth}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            properties: msg.properties,
            routing_key: routingKey || msg.routing_key,
            payload: msg.payload,
            payload_encoding: 'string',
          }),
        });
        
        if (!pubResponse.ok) {
          throw new Error(`Failed to publish message: status ${pubResponse.status}`);
        }
        replayed++;
      }

      return { success: true, replayed };
    } catch (error) {
      this.logger.error(`Error replaying DLQ messages`, error.message);
      throw new HttpException('Failed to replay messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
