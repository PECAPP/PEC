import { Injectable } from '@nestjs/common';
import { CoursesRepository } from './courses.repository';
import { CourseQueryDto } from './dto/course-query.dto';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CoursesService {
  constructor(private readonly repo: CoursesRepository) {}

  create(createCourseDto: CreateCourseDto) {
    return this.repo.create(createCourseDto);
  }

  findAll(query: CourseQueryDto) {
    return this.repo.findMany(query);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, updateCourseDto: UpdateCourseDto) {
    return this.repo.update(id, updateCourseDto);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
