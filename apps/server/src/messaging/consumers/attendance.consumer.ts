import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload, ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { firstValueFrom } from 'rxjs';

@Controller()
export class AttendanceConsumer {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
  ) {}

  @EventPattern('attendance.created')
  async handleAttendanceCreated(@Payload() data: any) {
    console.log('Received attendance.created event', data);
    
    // Write an audit log securely
    await this.prisma.auditLog.create({
      data: {
        action: 'CREATE',
        entity: 'Attendance',
        entityId: data.id || 'unknown',
        actorUserId: data.actorId || 'system',
        method: 'AMQP',
        path: 'attendance.created',
        ip: '127.0.0.1',
        metadata: JSON.stringify(data),
      },
    });

    // Enqueue secondary workflows via RabbitMQ
    await firstValueFrom(this.client.emit('notification.faculty', {
      type: 'attendance_marked',
      sessionId: data.sessionId,
      courseId: data.courseId,
    }));
    
    await firstValueFrom(this.client.emit('workflow.attendance_analytics', {
      attendanceId: data.id,
      studentId: data.studentId,
    }));
  }
}
