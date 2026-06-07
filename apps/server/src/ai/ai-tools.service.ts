import { Injectable } from '@nestjs/common';
import { AiAcademicToolsService } from './ai-academic-tools.service';
import { AiCampusToolsService } from './ai-campus-tools.service';
import { AiDiscoveryToolsService } from './ai-discovery-tools.service';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ToolCallResult {
  /** Raw JSON string to feed back to the LLM as a tool message. */
  functionResult: string;
  /** Optional SSE side-effects to emit immediately to the frontend. */
  sseEvents?: Array<Record<string, unknown>>;
}

// ── Service ───────────────────────────────────────────────────────────────────

/**
 * AiToolsService
 *
 * Thin dispatcher that maps tool names to their corresponding domain sub-service implementations.
 */
@Injectable()
export class AiToolsService {
  constructor(
    private readonly academicTools: AiAcademicToolsService,
    private readonly campusTools: AiCampusToolsService,
    private readonly discoveryTools: AiDiscoveryToolsService,
  ) {}

  // ── Public dispatch entry-point ──────────────────────────────────────────

  async dispatch(
    toolName: string,
    args: Record<string, any>,
    userId: string | undefined,
  ): Promise<ToolCallResult> {
    switch (toolName) {
      // ── Academic Tools ───────────────────────────────────────────────────
      case 'get_user_grades':
        return this.academicTools.getGrades(userId);

      case 'get_user_attendance':
        return this.academicTools.getAttendance(userId);

      case 'get_user_schedule':
        return this.academicTools.getSchedule(userId, args.day, args.courseCode, args.startTime);

      case 'get_upcoming_exams':
        return this.academicTools.getUpcomingExams(userId);

      case 'get_enrolled_courses':
        return this.academicTools.getEnrolledCourses(userId);

      // ── Campus Tools ─────────────────────────────────────────────────────
      case 'get_canteen_menu':
        return this.campusTools.getCanteenMenu(args.category);

      case 'get_night_canteen_menu':
        return this.campusTools.getNightCanteenMenu(args.category);

      case 'get_clubs':
        return this.campusTools.getClubs();

      case 'get_hostel_issues':
        return this.campusTools.getHostelIssues(userId);

      case 'navigate_to_page':
        return this.campusTools.navigate(args.path, args.pageName);

      // ── Discovery/Search Tools ───────────────────────────────────────────
      case 'search_college_notices':
        return this.discoveryTools.searchCollegeNotices(args.query);

      case 'search_marketplace':
        return this.discoveryTools.searchMarketplace(args.query);

      case 'get_upcoming_events':
        return this.discoveryTools.getUpcomingEvents();

      case 'get_finance_summary':
        return this.discoveryTools.getFinanceSummary(userId);

      default:
        return {
          functionResult: JSON.stringify({ error: `Unknown tool: ${toolName}` }),
        };
    }
  }
}
