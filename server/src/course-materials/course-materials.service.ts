import { Injectable } from '@nestjs/common';
import { CourseMaterialsRepository } from './course-materials.repository';
import { CourseMaterialQueryDto } from './dto/course-material-query.dto';
import { CreateCourseMaterialDto } from './dto/create-course-material.dto';

@Injectable()
export class CourseMaterialsService {
  constructor(private readonly repo: CourseMaterialsRepository) {}

  findMany(query: CourseMaterialQueryDto) {
    return this.repo.findMany(query);
  }

  create(data: CreateCourseMaterialDto) {
    return this.repo.create(data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
