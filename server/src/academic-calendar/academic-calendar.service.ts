import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicCalendarEventDto, UpdateAcademicCalendarEventDto } from './dto/create-academic-calendar-event.dto';

@Injectable()
export class AcademicCalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(month?: number, year?: number, eventType?: string, category?: string) {
    const where: any = {};

    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      where.date = {
        gte: startDate,
        lte: endDate,
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (category) {
      where.category = category;
    }

    return this.prisma.academicCalendarEvent.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }

  async findOne(id: string) {
    const event = await this.prisma.academicCalendarEvent.findUnique({
      where: { id },
    });

    if (!event) {
      throw new NotFoundException('Calendar event not found');
    }

    return event;
  }

  async create(data: CreateAcademicCalendarEventDto, userId?: string) {
    return this.prisma.academicCalendarEvent.create({
      data: {
        ...data,
        date: new Date(data.date),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: userId,
      },
    });
  }

  async replaceAll(events: CreateAcademicCalendarEventDto[], userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.academicCalendarEvent.deleteMany();

      const createdEvents = await Promise.all(
        events.map((event) =>
          tx.academicCalendarEvent.create({
            data: {
              ...event,
              date: new Date(event.date),
              endDate: event.endDate ? new Date(event.endDate) : null,
              createdBy: userId,
            },
          })
        )
      );

      return createdEvents;
    });
  }

  async update(id: string, data: UpdateAcademicCalendarEventDto) {
    await this.findOne(id);

    const updateData: any = { ...data };
    if (data.date) {
      updateData.date = new Date(data.date);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return this.prisma.academicCalendarEvent.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string) {
    await this.findOne(id);

    return this.prisma.academicCalendarEvent.delete({
      where: { id },
    });
  }

  async deleteAll() {
    return this.prisma.academicCalendarEvent.deleteMany();
  }

  async getUpcomingEvents(limit: number = 10) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.prisma.academicCalendarEvent.findMany({
      where: {
        date: {
          gte: today,
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: limit,
    });
  }

  async getEventsByDateRange(startDate: string, endDate: string) {
    return this.prisma.academicCalendarEvent.findMany({
      where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
