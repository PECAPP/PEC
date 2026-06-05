import { Injectable } from '@nestjs/common';
import { HostelIssuesRepository } from './hostel-issues.repository';
import { HostelIssueQueryDto } from './dto/hostel-issue-query.dto';
import { CreateHostelIssueDto } from './dto/create-hostel-issue.dto';
import { UpdateHostelIssueDto } from './dto/update-hostel-issue.dto';

@Injectable()
export class HostelIssuesService {
  constructor(private readonly repo: HostelIssuesRepository) {}

  findMany(query: HostelIssueQueryDto) {
    return this.repo.findMany(query);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  create(data: CreateHostelIssueDto) {
    return this.repo.create(data);
  }

  update(id: string, data: UpdateHostelIssueDto) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
