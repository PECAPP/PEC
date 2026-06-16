import '../load-env'; // Load environment variables first
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from '../app.module';

(async () => {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RMQ_URL || 'amqp://localhost:5672'],
      queue: 'pec_jobs_queue',
      queueOptions: {
        durable: false,
      },
    },
  });
  await app.listen();
  console.log('Background worker running.');

  // keep process alive
  process.on('SIGINT', async () => {
    await app.close();
    process.exit(0);
  });
})();
