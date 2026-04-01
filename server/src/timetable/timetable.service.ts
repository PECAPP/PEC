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
    const conflict = await this.repo.findConflicts({
      room: data.room,
      day: data.day,
      startTime: data.startTime,
      endTime: data.endTime,
      facultyId: data.facultyId,
      batch: data.batch,
      semester: data.semester,
    });
    if (conflict) {
      throw new Error(`Schedule conflict detected with ${conflict.courseCode} affecting either Room, Faculty, or Batch.`);
    }
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateTimetableDto) {
    const current = await this.repo.findById(id);
    if (!current) throw new Error('Timetable entry not found');

    if (data.room || data.day || data.startTime || data.endTime || data.facultyId || data.batch) {
       const conflict = await this.repo.findConflicts({
         room: data.room || current.room,
         day: data.day || current.day,
         startTime: data.startTime || current.startTime,
         endTime: data.endTime || current.endTime,
         facultyId: data.facultyId || current.facultyId,
         batch: data.batch || current.batch,
         semester: data.semester || current.semester,
         excludeId: id,
       });

       if (conflict) {
         throw new Error(`Conflict while updating schedule for ${conflict.courseCode}. Check Room/Faculty availability.`);
       }
    }
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
