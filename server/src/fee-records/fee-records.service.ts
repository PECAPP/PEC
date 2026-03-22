import { Injectable, NotFoundException } from '@nestjs/common';
import { FeeRecordsRepository } from './fee-records.repository';
import { FeeRecordQueryDto } from './dto/fee-record-query.dto';
import { CreateFeeRecordDto } from './dto/create-fee-record.dto';
import { UpdateFeeRecordDto } from './dto/update-fee-record.dto';

@Injectable()
export class FeeRecordsService {
  constructor(private readonly repo: FeeRecordsRepository) {}

  findAll(query: FeeRecordQueryDto, requester?: { userId?: string; role?: string }) {
    return this.repo.findMany(query, requester);
  }

  async findOne(id: string, requester?: { userId?: string; role?: string }) {
    const record = await this.repo.findById(id, requester);
    if (!record) {
      throw new NotFoundException('Fee record not found');
    }
    return record;
  }

  create(data: CreateFeeRecordDto) {
    return this.repo.create(data);
  }

  async update(id: string, data: UpdateFeeRecordDto, requester?: { userId?: string; role?: string }) {
    const updated = await this.repo.update(id, data, requester);
    if (!updated.count) {
      throw new NotFoundException('Fee record not found');
    }
    return this.findOne(id, requester);
  }

  remove(id: string) {
    return this.repo.remove(id);
  }
}
