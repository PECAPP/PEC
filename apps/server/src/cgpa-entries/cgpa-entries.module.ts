import { Module } from '@nestjs/common';
import { CgpaEntriesController } from './cgpa-entries.controller';
import { CgpaEntriesService } from './cgpa-entries.service';
import { CgpaEntriesRepository } from './cgpa-entries.repository';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [CgpaEntriesController],
  providers: [CgpaEntriesService, CgpaEntriesRepository],
})
export class CgpaEntriesModule {}

