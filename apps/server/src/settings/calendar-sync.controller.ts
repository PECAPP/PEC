import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';

@Controller('calendar')
export class CalendarSyncController {
  constructor(private readonly prisma: PrismaService) {}

  @Get(':icalToken.ics')
  async generateCalendar(@Param('icalToken') icalToken: string, @Res() res: Response) {
    const settings = await this.prisma.userSettings.findUnique({
      where: { id: icalToken },
      include: { user: { select: { name: true } } }
    });

    if (!settings) {
      throw new NotFoundException('Invalid Calendar Token');
    }

    // In a real implementation, you would fetch timetable and exam entries for `settings.userId`
    // and format them into VCALENDAR standard string using a library like `ics`.

    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//PEC Campus ERP//Calendar Sync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:PEC Schedule - ${settings.user.name}
X-WR-TIMEZONE:Asia/Kolkata
BEGIN:VEVENT
UID:sample-event@erp.pec.edu
DTSTAMP:20240101T000000Z
DTSTART:20240101T090000Z
DTEND:20240101T100000Z
SUMMARY:Sample Class
DESCRIPTION:Sample description
END:VEVENT
END:VCALENDAR`;

    res.set({
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': `attachment; filename="pec_calendar.ics"`,
    });

    res.send(icsContent);
  }
}
