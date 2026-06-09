import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { DlqService } from './dlq.service';
import { DlqController } from './dlq.controller';

@Module({
  imports: [HttpModule],
  controllers: [DlqController],
  providers: [DlqService],
})
export class DlqModule {}
