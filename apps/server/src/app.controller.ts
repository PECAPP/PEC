import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @GrpcMethod('HelloService', 'SayHello')
  sayHello(data: { name: string }): { message: string } {
    return { message: `Hello ${data.name} via gRPC!` };
  }
}
