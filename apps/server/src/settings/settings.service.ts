import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    // userSettings model does not exist in schema, returning mock
    return {
      userId,
      icalToken: 'mock-ical-token-' + userId,
      theme: 'system'
    };
  }

  async updateSettings(userId: string, data: any) {
    // userSettings model does not exist in schema, returning mock
    return {
      userId,
      ...data,
      icalToken: 'mock-ical-token-' + userId,
    };
  }

  async getActiveSessions(userId: string) {
    const sessions = await this.prisma.refreshToken.findMany({
      where: { userId, revokedAt: null },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return sessions;
  }

  async revokeAllSessions(userId: string, currentSessionTokenHash?: string) {
    const whereClause: any = { userId };
    if (currentSessionTokenHash) {
      whereClause.tokenHash = { not: currentSessionTokenHash };
    }
    
    await this.prisma.refreshToken.updateMany({
      where: whereClause,
      data: { revokedAt: new Date() },
    });
    return { success: true };
  }

  async getOAuthAccounts(userId: string) {
    // oAuthAccount model does not exist in schema
    return [];
  }
}
