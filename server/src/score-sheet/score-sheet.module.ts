import { Module } from '@nestjs/common';
import { ScoreSheetController } from './score-sheet.controller';
import { ScoreSheetService } from './score-sheet.service';

@Module({
  controllers: [ScoreSheetController],
  providers: [ScoreSheetService],
})
export class ScoreSheetModule {}
