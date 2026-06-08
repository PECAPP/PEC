import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAcademicCalendarEventDto, UpdateAcademicCalendarEventDto } from './dto/create-academic-calendar-event.dto';

@Injectable()
export class AcademicCalendarService {
  constructor(private prisma: PrismaService) {}

  async findAll(startDate?: string, endDate?: string, eventType?: string, category?: string) {
    const where: any = {};

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (eventType) {
      where.eventType = eventType;
    }

    if (category) {
      where.category = category;
    }

    return this.prisma.academicCalendarEvent.findMany({ where,
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
    const { startDate, type, isPublic, ...rest } = data as any;
    return this.prisma.academicCalendarEvent.create({
      data: {
        ...rest,
        eventType: type || 'academic',
        category: type || 'academic',
        date: new Date(startDate),
        endDate: data.endDate ? new Date(data.endDate) : null,
        createdBy: userId,
      },
    });
  }

  async replaceAll(events: CreateAcademicCalendarEventDto[], userId?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.academicCalendarEvent.deleteMany();

      const createdEvents = await Promise.all(
        events.map((event) => {
          const { startDate, type, isPublic, ...rest } = event as any;
          return tx.academicCalendarEvent.create({
            data: {
              ...rest,
              eventType: type || 'academic',
              category: type || 'academic',
              date: new Date(startDate),
              endDate: event.endDate ? new Date(event.endDate) : null,
              createdBy: userId,
            },
          });
        })
      );

      return createdEvents;
    });
  }

  async update(id: string, data: UpdateAcademicCalendarEventDto, userId?: string, userRole?: string) {
    const event = await this.findOne(id);
    if (userId && event.createdBy !== userId && userRole !== 'admin' && userRole !== 'college_admin') {
      throw new Error('Unauthorized to update this event');
    }

    const updateData: any = { ...data };
    if (data.startDate) {
      updateData.date = new Date(data.startDate);
    }
    if (data.endDate) {
      updateData.endDate = new Date(data.endDate);
    }

    return this.prisma.academicCalendarEvent.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId?: string, userRole?: string) {
    const event = await this.findOne(id);
    if (userId && event.createdBy !== userId && userRole !== 'admin' && userRole !== 'college_admin') {
      throw new Error('Unauthorized to delete this event');
    }

    return this.prisma.academicCalendarEvent.delete({
      where: { id },
    });
  }

  async deleteAll() {
    return this.prisma.academicCalendarEvent.deleteMany();
  }

  async getUpcomingEvents(limit: number = 10, localCurrentDate?: string) {
    const today = localCurrentDate ? new Date(localCurrentDate) : new Date();

    return this.prisma.academicCalendarEvent.findMany({ where: {
        date: {
          gte: today,
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
      take: limit,
    });
  }

  async getEventsByDateRange(startDate: string, endDate: string) {
    return this.prisma.academicCalendarEvent.findMany({ where: {
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });
  }
}
