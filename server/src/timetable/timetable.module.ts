import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TimetableController } from './timetable.controller';
import { TimetableService } from './timetable.service';
import { TimetableRepository } from './timetable.repository';

@Module({
  imports: [PrismaModule],
  controllers: [TimetableController],
  providers: [TimetableService, TimetableRepository],
})
export class TimetableModule {}
