import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { ToolCallResult } from './ai-tools.service';

/**
 * AiCampusToolsService
 *
 * Handles all campus-related tools:
 *   - get_canteen_menu
 *   - get_night_canteen_menu
 *   - get_clubs
 *   - get_hostel_issues
 *   - navigate_to_page
 */
@Injectable()
export class AiCampusToolsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Hostel Issues ────────────────────────────────────────────────────────

  async getHostelIssues(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    const raw = await this.fetchHostelIssues(userId);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The list of reported hostel issues has been shown to the user in a formatted dashboard widget. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ hostelIssuesData: JSON.parse(raw) }],
    };
  }

  // ── Canteen Menu ─────────────────────────────────────────────────────────

  async getCanteenMenu(category?: string): Promise<ToolCallResult> {
    const raw = await this.fetchCanteenMenu(category);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The canteen menu has been shown to the user in a formatted interactive grid. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ canteenData: JSON.parse(raw) }],
    };
  }

  // ── Clubs ────────────────────────────────────────────────────────────────

  async getClubs(): Promise<ToolCallResult> {
    const raw = await this.fetchClubs();
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The list of student clubs has been shown to the user. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ clubsData: JSON.parse(raw) }],
    };
  }

  // ── Night Canteen Menu ────────────────────────────────────────────────────

  async getNightCanteenMenu(category?: string): Promise<ToolCallResult> {
    const raw = await this.fetchNightCanteenMenu(category);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The night canteen menu has been shown to the user in a formatted interactive grid. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ nightCanteenData: JSON.parse(raw) }],
    };
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  navigate(path: string, pageName: string): ToolCallResult {
    const resolvedPath = path ?? '/dashboard';
    const resolvedName = pageName ?? resolvedPath;
    return {
      functionResult: JSON.stringify({ navigated: true, path: resolvedPath, pageName: resolvedName }),
      sseEvents: [{ navigate: resolvedPath }],
    };
  }

  // ── Private data-fetching helpers ─────────────────────────────────────────

  private async fetchHostelIssues(userId: string): Promise<string> {
    try {
      const issues = await this.prisma.hostelIssue.findMany({
        where: { studentId: userId },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          title: true,
          category: true,
          roomNumber: true,
          status: true,
          priority: true,
          description: true,
          createdAt: true,
        },
      });
      return JSON.stringify({ issues });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch hostel issues: ' + err.message });
    }
  }

  private async fetchCanteenMenu(category?: string): Promise<string> {
    try {
      const items = await this.prisma.canteenItem.findMany({
        where: {
          isAvailable: true,
          ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        take: 25,
        select: { name: true, price: true, category: true, description: true, stock: true },
      });
      return JSON.stringify({ items });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch canteen menu: ' + err.message });
    }
  }

  private async fetchClubs(): Promise<string> {
    try {
      const clubs = await this.prisma.club.findMany({
        orderBy: { name: 'asc' },
        select: { name: true, createdAt: true },
      });
      return JSON.stringify({ clubs });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch clubs: ' + err.message });
    }
  }

  private async fetchNightCanteenMenu(category?: string): Promise<string> {
    try {
      const items = await this.prisma.canteenItem.findMany({
        where: {
          isAvailable: true,
          ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        take: 25,
        select: { name: true, price: true, category: true, description: true, stock: true },
      });
      return JSON.stringify({
        items,
        note: 'This is the night canteen menu available for after-hours ordering.',
      });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch night canteen menu: ' + err.message });
    }
  }
}
