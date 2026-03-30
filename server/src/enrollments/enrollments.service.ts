import { Injectable } from '@nestjs/common';
import { EnrollmentsRepository } from './enrollments.repository';
import { EnrollmentQueryDto } from './dto/enrollment-query.dto';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly repo: EnrollmentsRepository) {}

  findAll(query: EnrollmentQueryDto) {
    return this.repo.findMany(query);
  }

  create(data: CreateEnrollmentDto) {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateEnrollmentDto) {
    return this.repo.update(id, data);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }
}
