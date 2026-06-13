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
    const priority = data.priority || 'medium';
    const slaDeadline = new Date();
    
    if (priority === 'emergency') {
      slaDeadline.setHours(slaDeadline.getHours() + 2); // 2 hours for emergency
    } else if (priority === 'high') {
      slaDeadline.setHours(slaDeadline.getHours() + 12); // 12 hours for high
    } else if (priority === 'medium') {
      slaDeadline.setHours(slaDeadline.getHours() + 48); // 48 hours for medium
    } else {
      slaDeadline.setHours(slaDeadline.getHours() + 120); // 5 days for low
    }
    
    return this.repo.create({ ...data, slaDeadline: slaDeadline.toISOString() } as any);
  }

  update(id: string, data: UpdateHostelIssueDto) {
    return this.repo.update(id, data);
  }

  delete(id: string) {
    return this.repo.delete(id);
  }
}
