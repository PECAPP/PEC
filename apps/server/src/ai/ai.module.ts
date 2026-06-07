import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { RagService } from './rag.service';
import { AiToolsService } from './ai-tools.service';
import { AiAcademicToolsService } from './ai-academic-tools.service';
import { AiCampusToolsService } from './ai-campus-tools.service';
import { AiDiscoveryToolsService } from './ai-discovery-tools.service';
import { AiCalendarParserService } from './ai-calendar-parser.service';
import { AiOrchestrationService } from './ai-orchestration.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AttendanceModule } from '../attendance/attendance.module';
import { TimetableModule } from '../timetable/timetable.module';

@Module({
  imports: [PrismaModule, AttendanceModule, TimetableModule],
  providers: [
    // Sub-services (dependency order: no circular deps)
    RagService,
    AiAcademicToolsService,
    AiCampusToolsService,
    AiDiscoveryToolsService,
    AiToolsService,
    AiCalendarParserService,
    AiOrchestrationService,
    // Public façade consumed by controller and external modules
    AiService,
  ],
  controllers: [AiController],
  exports: [AiService, RagService],
})
export class AiModule {}
