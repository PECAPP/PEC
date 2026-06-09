import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MessagingService } from './messaging.service';
import { AttendanceConsumer } from './consumers/attendance.consumer';
import { PrismaModule } from '../prisma/prisma.module';
import { BackgroundJobsModule } from '../background-jobs/background-jobs.module';
import { QueueModule } from '../background-jobs/queue.module';

@Module({
  imports: [
    PrismaModule,
    BackgroundJobsModule,
    QueueModule,
    ClientsModule.register([
      {
        name: 'RABBITMQ_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: process.env.RABBITMQ_QUEUE || 'pec_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [AttendanceConsumer],
  providers: [MessagingService],
  exports: [MessagingService],
})
export class MessagingModule {}
