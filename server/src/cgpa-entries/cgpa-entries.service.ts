import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CgpaEntriesRepository } from './cgpa-entries.repository';
import { CgpaEntryQueryDto } from './dto/cgpa-entry-query.dto';
import { CreateCgpaEntryDto } from './dto/create-cgpa-entry.dto';
import { UpdateCgpaEntryDto } from './dto/update-cgpa-entry.dto';

const ELEVATED_ROLES = new Set([
  'faculty',
  'college_admin',
  'admin',
  'moderator',
  'super_admin',
]);

@Injectable()
export class CgpaEntriesService {
  constructor(private readonly repo: CgpaEntriesRepository) {}

  findMany(requesterId: string, requesterRole: string, query: CgpaEntryQueryDto) {
    const canReadOthers = ELEVATED_ROLES.has(requesterRole);
    const targetUserId = canReadOthers && query.userId ? query.userId : requesterId;
    return this.repo.findManyByUser(targetUserId, query);
  }

  async findOne(id: string, requesterId: string, requesterRole: string) {
    const entry = await this.repo.findById(id);
    if (!entry) {
      throw new NotFoundException('CGPA entry not found');
    }

    const isOwner = entry.userId === requesterId;
    if (!isOwner && !ELEVATED_ROLES.has(requesterRole)) {
      throw new ForbiddenException('Not allowed to access this entry');
    }

    return entry;
  }

  create(requesterId: string, data: CreateCgpaEntryDto) {
    return this.repo.createForUser(requesterId, data);
  }

  async update(
    id: string,
    requesterId: string,
    requesterRole: string,
    data: UpdateCgpaEntryDto,
  ) {
    await this.findOne(id, requesterId, requesterRole);
    return this.repo.update(id, data);
  }

  async remove(id: string, requesterId: string, requesterRole: string) {
    await this.findOne(id, requesterId, requesterRole);
    return this.repo.remove(id);
  }

  async getAcademicStats(userId: string) {
    const entries = await this.repo.findManyByUser(userId, { limit: 1000, offset: 0 });
    const items = entries.items as any[]; // Cast for current repository return type

    if (items.length === 0) {
      return { semesters: [], cgpa: 0, totalCredits: 0, backlogCount: 0 };
    }

    // Sort by semester
    const bySemester: Record<number, any[]> = {};
    items.forEach((entry: any) => {
      if (!bySemester[entry.semester]) {
        bySemester[entry.semester] = [];
      }
      bySemester[entry.semester].push(entry);
    });

    // Weighted calculations
    // Core = 1.0, Electives = 1.0, Honors = 1.1 (Example weightage)
    const weights: Record<string, number> = {
      core: 1.0,
      elective: 1.0,
      minor: 1.0,
      honors: 1.1,
    };

    let totalWeightedPoints = 0;
    let totalCredits = 0;
    let backlogCount = 0;
    const sgpaList = [];

    // All unique semesters sorted
    const semesters = Object.keys(bySemester)
      .map(Number)
      .sort((a, b) => a - b);

    for (const sem of semesters) {
      const semEntries = bySemester[sem];
      let semPoints = 0;
      let semCredits = 0;

      for (const entry of semEntries) {
        const type = String(entry.courseType || 'core').toLowerCase();
        const weight = weights[type] || 1.0;
        const entryCredits = Number(entry.credits) || 0;
        const entryGrade = Number(entry.gradePoint) || 0;

        // Calculate SGPA including all attempts
        semPoints += entryGrade * entryCredits * weight;
        semCredits += entryCredits;

        // Global CGPA accumulation
        totalWeightedPoints += entryGrade * entryCredits * weight;
        totalCredits += entryCredits;

        // Backlog detection (Grade < 4.0 is Fail)
        if (entryGrade < 4.0) {
          backlogCount++;
        }
      }

      sgpaList.push({
        semester: sem,
        sgpa: semCredits > 0 ? Number((semPoints / semCredits).toFixed(3)) : 0,
        credits: semCredits,
        isProvisional: false,
      });
    }

    const cgpa = totalCredits > 0 ? Number((totalWeightedPoints / totalCredits).toFixed(3)) : 0;

    return {
      semesters: sgpaList,
      cgpa,
      totalCredits,
      backlogCount,
    };
  }
}

