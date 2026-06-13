import { Injectable, HttpException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async getSettings(userId: string) {
    try {
      const settings = await this.prisma.userSettings.upsert({
        where: { userId },
        update: {},
        create: { 
          user: { connect: { id: userId } }
        },
      });
      return settings;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        // Race condition: another request just created the settings
        const existing = await this.prisma.userSettings.findUnique({
          where: { userId }
        });
        if (existing) return existing;
      }
      console.error("GET_SETTINGS_ERROR:", error);
      throw new HttpException(error?.message || 'Unknown error', 500);
    }
  }

  async updateSettings(userId: string, data: any) {
    const settings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    return settings;
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
