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

  create(data: CreateTimetableDto) {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateTimetableDto) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
