import { Injectable } from '@nestjs/common';
import { JobsRepository } from './jobs.repository';
import { JobQueryDto } from './dto/job-query.dto';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly repo: JobsRepository) {}

  findAll(query: JobQueryDto) {
    return this.repo.findMany(query);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  create(data: CreateJobDto) {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateJobDto) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
