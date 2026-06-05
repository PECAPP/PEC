try { require('dotenv/config'); } catch (e) {}
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { Logger } from 'nestjs-pino';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  configureApp(app);

  let protoPath = join(process.cwd(), '../../packages/protos/hello.proto');
  if (!require('fs').existsSync(protoPath)) {
    protoPath = join(process.cwd(), 'packages/protos/hello.proto');
  }
  if (!require('fs').existsSync(protoPath)) {
    protoPath = '/app/packages/protos/hello.proto';
  }

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'hello',
      protoPath,
      url: '0.0.0.0:50051',
    },
  });

  // Also connect a RabbitMQ microservice listener so this app can consume events
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
      queue: process.env.RABBITMQ_QUEUE || 'pec_queue',
      queueOptions: { 
        durable: true,
        arguments: {
          'x-dead-letter-exchange': 'pec_dlx',
          'x-dead-letter-routing-key': 'pec_dlq_routing_key'
        }
      },
    },
  });

  // Enable API docs in development
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('PEC APP API')
      .setDescription('The PEC APP ERP Institutional API Service')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }

  // Graceful Shutdown implementation
  app.enableShutdownHooks();

  await app.startAllMicroservices();
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
