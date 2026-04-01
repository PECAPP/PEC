import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AcademicCalendarService } from './academic-calendar.service';
import { AiService } from '../ai/ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { CreateAcademicCalendarEventDto, UpdateAcademicCalendarEventDto } from './dto/create-academic-calendar-event.dto';

@Controller('academic-calendar')
@UseGuards(AuthGuard, RolesGuard)
export class AcademicCalendarController {
  constructor(
    private readonly calendarService: AcademicCalendarService,
    private readonly aiService: AiService,
  ) {}

  @Post('upload-pdf')
  @Roles('admin')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPdf(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const pdfBase64 = file.buffer.toString('base64');
    const events = await this.aiService.parseAcademicCalendarPdf(pdfBase64);

    return {
      message: `Successfully parsed ${events.length} events from PDF`,
      events,
    };
  }

  @Post('upload-pdf-base64')
  @Roles('admin')
  async uploadPdfBase64(@Body() body: { pdfBase64: string }) {
    const events = await this.aiService.parseAcademicCalendarPdf(body.pdfBase64);

    return {
      message: `Successfully parsed ${events.length} events from PDF`,
      events,
    };
  }

  @Post('bulk-import')
  @Roles('admin')
  async bulkImport(@Body() body: { events: CreateAcademicCalendarEventDto[] }, @Query('userId') userId?: string) {
    const createdEvents = await this.calendarService.replaceAll(body.events, userId);

    return {
      message: `Successfully replaced calendar with ${createdEvents.length} events`,
      events: createdEvents,
    };
  }

  @Get()
  async findAll(
    @Query('month') month?: number,
    @Query('year') year?: number,
    @Query('eventType') eventType?: string,
    @Query('category') category?: string,
  ) {
    return this.calendarService.findAll(month, year, eventType, category);
  }

  @Get('upcoming')
  async getUpcoming(@Query('limit') limit?: number) {
    return this.calendarService.getUpcomingEvents(limit || 10);
  }

  @Get('range')
  async getByRange(@Query('start') start: string, @Query('end') end: string) {
    return this.calendarService.getEventsByDateRange(start, end);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.calendarService.findOne(id);
  }

  @Post()
  @Roles('admin')
  async create(@Body() data: CreateAcademicCalendarEventDto, @Query('userId') userId?: string) {
    return this.calendarService.create(data, userId);
  }

  @Patch(':id')
  @Roles('admin')
  async update(@Param('id') id: string, @Body() data: UpdateAcademicCalendarEventDto) {
    return this.calendarService.update(id, data);
  }

  @Delete(':id')
  @Roles('admin')
  async delete(@Param('id') id: string) {
    return this.calendarService.delete(id);
  }

  @Delete()
  @Roles('admin')
  async deleteAll() {
    return this.calendarService.deleteAll();
  }
}
