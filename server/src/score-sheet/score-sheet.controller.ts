import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ScoreSheetService } from './score-sheet.service';
import { CreateScoreEntryDto } from './dto/create-score-entry.dto';
import { ScoreEntryQueryDto } from './dto/score-entry-query.dto';

@UseGuards(AuthGuard)
@Controller('score-sheet')
export class ScoreSheetController {
  constructor(private readonly service: ScoreSheetService) {}

  @Get()
  findMany(@Query() query: ScoreEntryQueryDto, @Request() req: any) {
    const studentId = query.studentId || req.user?.sub;
    return this.service.findMany({ ...query, studentId });
  }

  @Get('stats')
  getStats(@Request() req: any) {
    return this.service.getStats(req.user?.sub);
  }

  @Post()
  create(@Body() body: CreateScoreEntryDto) {
    return this.service.create(body);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreateScoreEntryDto>) {
    return this.service.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.delete(id);
  }
}
