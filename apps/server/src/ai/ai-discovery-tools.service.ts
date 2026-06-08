import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RagService } from './rag.service';
import type { ToolCallResult } from './ai-tools.service';

/**
 * AiDiscoveryToolsService
 *
 * Handles college discovery and search tools:
 *   - search_college_notices (RAG)
 *   - search_marketplace
 *   - get_upcoming_events
 *   - get_finance_summary
 */
@Injectable()
export class AiDiscoveryToolsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
  ) {}

  // ── Notices (RAG) ────────────────────────────────────────────────────────

  async searchCollegeNotices(query: string): Promise<ToolCallResult> {
    const results = await this.ragService.getCollegeNotices(query);
    return { functionResult: JSON.stringify(results) };
  }

  // ── Marketplace ──────────────────────────────────────────────────────────

  async searchMarketplace(query: string): Promise<ToolCallResult> {
    const listings = await this.prisma.marketplaceListing.findMany({
      where: {
        title: { contains: query, mode: 'insensitive' },
        status: 'Available',
      },
      take: 5,
      select: {
        id: true,
        title: true,
        price: true,
        category: true,
        condition: true,
        description: true,
      },
    });
    return { functionResult: JSON.stringify(listings) };
  }

  // ── Events ───────────────────────────────────────────────────────────────

  async getUpcomingEvents(): Promise<ToolCallResult> {
    const events = await this.prisma.academicCalendarEvent.findMany({
      where: { date: { gte: new Date() } },
      orderBy: { date: 'asc' },
      take: 8,
      select: {
        title: true,
        description: true,
        date: true,
        eventType: true,
        importance: true,
      },
    });
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The upcoming events timeline has been shown to the user. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ eventsData: { events } }],
    };
  }

  // ── Finance Summary ──────────────────────────────────────────────────────

  async getFinanceSummary(userId: string | undefined): Promise<ToolCallResult> {
    if (!userId) {
      return { functionResult: JSON.stringify({ error: 'User not authenticated' }) };
    }
    const raw = await this.fetchFinanceSummary(userId);
    return {
      functionResult: JSON.stringify({
        displayed: true,
        message:
          'The fee payment summary has been shown to the user in a formatted dashboard widget. Write a short 1-2 sentence summary of their dues. Do NOT repeat or list the raw data.',
      }),
      sseEvents: [{ financeData: JSON.parse(raw) }],
    };
  }

  // ── Private data-fetching helpers ─────────────────────────────────────────

  private async fetchFinanceSummary(userId: string): Promise<string> {
    try {
      const fees = await this.prisma.feeRecord.findMany({
        where: { studentId: userId, deletedAt: null },
        orderBy: { dueDate: 'asc' },
        select: {
          id: true,
          amount: true,
          lateFeeAmount: true,
          description: true,
          category: true,
          status: true,
          dueDate: true,
          semester: true,
          month: true,
        },
      });

      if (fees.length === 0) {
        return JSON.stringify({ message: 'No fee records found.', totalPending: 0, totalPaid: 0, overdueCount: 0 });
      }

      const totalPending = fees
        .filter((f) => f.status === 'pending')
        .reduce((s, f) => s + f.amount + f.lateFeeAmount, 0);

      const totalPaid = fees
        .filter((f) => f.status === 'paid')
        .reduce((s, f) => s + f.amount, 0);

      const now = new Date();
      const overdueFees = fees.filter(
        (f) => f.status === 'pending' && new Date(f.dueDate) < now,
      );

      const pendingFees = fees
        .filter((f) => f.status === 'pending')
        .map((f) => ({
          category: f.category,
          description: f.description,
          amount: f.amount + f.lateFeeAmount,
          dueDate: f.dueDate,
          semester: f.semester,
          month: f.month,
          overdue: new Date(f.dueDate) < now,
        }));

      return JSON.stringify({
        totalPending,
        totalPaid,
        overdueCount: overdueFees.length,
        pendingFees,
      });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch finance summary: ' + err.message });
    }
  }
}
