import { Module } from '@nestjs/common';
import { AttendanceSessionController } from './attendance-session.controller';
import { AttendanceSessionService } from './attendance-session.service';
import { AttendanceSessionRepository } from './attendance-session.repository';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AttendanceSessionController],
  providers: [AttendanceSessionService, AttendanceSessionRepository],
  exports: [AttendanceSessionService],
})
export class AttendanceSessionModule {}
