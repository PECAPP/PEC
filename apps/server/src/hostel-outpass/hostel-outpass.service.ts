import { Injectable, NotFoundException } from '@nestjs/common';
import { HostelOutpassRepository } from './hostel-outpass.repository';
import * as crypto from 'crypto';

@Injectable()
export class HostelOutpassService {
  constructor(private readonly repo: HostelOutpassRepository) {}

  findMany(query: any) {
    return this.repo.findMany(query);
  }

  findById(id: string) {
    return this.repo.findById(id);
  }

  create(data: any) {
    return this.repo.create(data);
  }

  async updateStatus(id: string, status: string, adminId: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Outpass not found');
    
    const updateData: any = { status, approvedBy: adminId };
    
    // Generate QR code if approved
    if (status === 'Approved' && !existing.qrCode) {
      updateData.qrCode = crypto.createHash('sha256').update(`${existing.id}-${Date.now()}`).digest('hex').slice(0, 16);
    }

    return this.repo.update(id, updateData);
  }
}
