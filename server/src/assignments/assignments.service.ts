import { Injectable } from '@nestjs/common';
import { AssignmentsRepository } from './assignments.repository';
import { AssignmentQueryDto } from './dto/assignment-query.dto';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

@Injectable()
export class AssignmentsService {
  constructor(private readonly repo: AssignmentsRepository) {}

  create(data: CreateAssignmentDto) {
    return this.repo.create(data);
  }

  findAll(query: AssignmentQueryDto) {
    return this.repo.findMany(query);
  }

  findOne(id: string) {
    return this.repo.findById(id);
  }

  update(id: string, data: UpdateAssignmentDto) {
    return this.repo.update(id, data);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
