import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CollegeSettingsService {
  constructor(private prisma: PrismaService) {}

  async getSettings() {
    const settings = await this.prisma.collegeSettings.findUnique({
      where: { id: 'main' },
    });

    if (!settings) {
      // Return defaults if not seeded
      return this.prisma.collegeSettings.create({
        data: { id: 'main' },
      });
    }

    return settings;
  }

  async updateSettings(data: any) {
    return this.prisma.collegeSettings.upsert({
      where: { id: 'main' },
      update: data,
      create: { ...data, id: 'main' },
    });
  }
}
