import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RagService } from './rag.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { TimetableModule } from '../timetable/timetable.module';

@Module({
  imports: [PrismaModule, AttendanceModule, TimetableModule],
  providers: [AiService, RagService],
  controllers: [AiController],
  exports: [AiService, RagService]
})
export class AiModule {}

