import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../background-jobs/queue.service';

@Controller()
export class AttendanceConsumer {
  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
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
        actorId: data.actorId || 'system',
        details: data,
        ipAddress: '127.0.0.1',
        userAgent: 'AttendanceConsumer',
      },
    });

    // Enqueue secondary workflows via RabbitMQ
    await this.queueService.addJob('notification.faculty', {
      type: 'attendance_marked',
      sessionId: data.sessionId,
      courseId: data.courseId,
    });
    
    await this.queueService.addJob('workflow.attendance_analytics', {
      attendanceId: data.id,
      studentId: data.studentId,
    });
  }
}
