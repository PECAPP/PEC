import { Module } from '@nestjs/common';
import { ExaminationsController } from './examinations.controller';
import { ExaminationsService } from './examinations.service';

@Module({
  controllers: [ExaminationsController],
  providers: [ExaminationsService],
})
export class ExaminationsModule {}
