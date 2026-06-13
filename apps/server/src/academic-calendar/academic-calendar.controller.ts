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
  BadRequestException,
  Req,
} from '@nestjs/common';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';
import { Throttle } from '@nestjs/throttler';
import { AcademicCalendarService } from './academic-calendar.service';
import { AiService } from '../ai/ai.service';
import { AuthGuard } from '../auth/auth.guard';
import { PoliciesGuard } from '../auth/guards/policies.guard';
import { CheckPolicies } from '../auth/decorators/check-policies.decorator';
import { S3Service } from '../common/services/s3.service';


import { CreateAcademicCalendarEventDto, UpdateAcademicCalendarEventDto } from './dto/create-academic-calendar-event.dto';


@Controller('academic-calendar')
@UseGuards(AuthGuard, PoliciesGuard)
export class AcademicCalendarController {
  constructor(
    private readonly calendarService: AcademicCalendarService,
    private readonly aiService: AiService,
    private readonly s3Service: S3Service,
  ) {}

  @Post('upload-pdf')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute per IP for AI parsing
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async uploadPdf(@Body() body: { fileKey: string }) {
    if (!body.fileKey) {
      throw new BadRequestException('No fileKey provided');
    }

    const buffer = await this.s3Service.getObjectBuffer(body.fileKey);
    const pdfBase64 = buffer.toString('base64');
    const events = await this.aiService.parseAcademicCalendarPdf(pdfBase64);

    return {
      message: `Successfully parsed ${events.length} events from PDF`,
      events,
    };
  }

  @Post('upload-pdf-base64')
  @Throttle({ default: { limit: 3, ttl: 60000 } }) // 3 requests per minute per IP
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async uploadPdfBase64(@Body() body: { pdfBase64: string }) {
    // Restrict Base64 payload size (approx 5MB binary = ~6.8MB Base64)
    if (!body.pdfBase64 || body.pdfBase64.length > 7 * 1024 * 1024) {
      throw new BadRequestException('Payload too large. Maximum size is 5MB.');
    }

    const buffer = Buffer.from(body.pdfBase64, 'base64');
    // Legacy ClamAV scan removed

    const events = await this.aiService.parseAcademicCalendarPdf(body.pdfBase64);

    return {
      message: `Successfully parsed ${events.length} events from PDF`,
      events,
    };
  }

  @Post('bulk-import')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async bulkImport(@Body() body: { events: CreateAcademicCalendarEventDto[] }, @Req() req: any) {
    const createdEvents = await this.calendarService.replaceAll(body.events, req.user?.id);

    return {
      message: `Successfully replaced calendar with ${createdEvents.length} events`,
      events: createdEvents,
    };
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  async findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('eventType') eventType?: string,
    @Query('category') category?: string,
  ) {
    return this.calendarService.findAll(startDate, endDate, eventType, category);
  }

  @Get('upcoming')
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(300000) // 5 minutes
  async getUpcoming(@Query('limit') limit?: number, @Query('localCurrentDate') localCurrentDate?: string) {
    return this.calendarService.getUpcomingEvents(limit || 10, localCurrentDate);
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
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async create(@Body() data: CreateAcademicCalendarEventDto, @Req() req: any) {
    return this.calendarService.create(data, req.user?.id);
  }

  @Patch(':id')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async update(@Param('id') id: string, @Body() data: UpdateAcademicCalendarEventDto, @Req() req: any) {
    return this.calendarService.update(id, data, req.user?.id, req.user?.role);
  }

  @Delete(':id')
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async delete(@Param('id') id: string, @Req() req: any) {
    return this.calendarService.delete(id, req.user?.id, req.user?.role);
  }

  @Delete()
  @CheckPolicies((ability) => ability.can('manage', 'all'))
  async deleteAll() {
    return this.calendarService.deleteAll();
  }
}

