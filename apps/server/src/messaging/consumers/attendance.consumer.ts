import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';

@Controller()
export class AttendanceConsumer {
  @EventPattern('attendance.created')
  async handleAttendanceCreated(@Payload() data: any) {
    // basic consumer: integrate analytics, notifications, etc.
    console.log('Received attendance.created event', data);
    // TODO: enqueue secondary workflows, write audit logs, notify faculty, etc.
  }
}
