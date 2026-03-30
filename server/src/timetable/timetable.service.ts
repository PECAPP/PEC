import { Injectable } from '@nestjs/common';
import { TimetableRepository } from './timetable.repository';
import { TimetableQueryDto } from './dto/timetable-query.dto';
import { CreateTimetableDto } from './dto/create-timetable.dto';
import { UpdateTimetableDto } from './dto/update-timetable.dto';

@Injectable()
export class TimetableService {
  constructor(private readonly repo: TimetableRepository) {}

  findAll(query: TimetableQueryDto) {
    return this.repo.findMany(query);
  }

  async create(data: CreateTimetableDto) {
    const conflict = await this.repo.findConflicts(data.room, data.day, data.startTime, data.endTime);
    if (conflict) {
      throw new Error(`Room conflict: ${data.room} is already occupied by ${conflict.courseCode} on ${data.day} ${data.startTime}-${data.endTime}`);
    }
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateTimetableDto) {
    const current = await this.repo.findById(id);
    if (!current) throw new Error('Timetable entry not found');

    if (data.room || data.day || data.startTime || data.endTime) {
       const room = data.room || current.room;
       const day = data.day || current.day;
       const start = data.startTime || current.startTime;
       const end = data.endTime || current.endTime;
       
       const conflict = await this.repo.findConflicts(room, day, start, end, id);
       if (conflict) {
         throw new Error(`Room conflict during reschedule: ${room} is already occupied by ${conflict.courseCode} on ${day} ${start}-${end}`);
       }
    }
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
