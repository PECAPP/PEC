import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

import { PrismaService } from '../prisma/prisma.service';
import { RagService } from './rag.service';
import { AttendanceRepository } from '../attendance/attendance.repository';
import { TimetableRepository } from '../timetable/timetable.repository';

@Injectable()
export class AiService {
  private openaiClient: OpenAI | null = null;
  private geminiModel: GenerativeModel | null = null;
  private readonly isGithubModelsProvider: boolean;

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
    private readonly attendanceRepo: AttendanceRepository,
    private readonly timetableRepo: TimetableRepository,
  ) {
    this.isGithubModelsProvider = Boolean(process.env.GITHUB_AI_API_KEY || process.env.GITHUB_TOKEN);

    const openaiApiKey = process.env.GITHUB_AI_API_KEY || process.env.GITHUB_TOKEN || process.env.OPENAI_API_KEY;
    if (openaiApiKey) {
      this.openaiClient = new OpenAI({
        apiKey: openaiApiKey,
        baseURL: this.isGithubModelsProvider
          ? 'https://models.github.ai/inference'
          : undefined,
      });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (geminiApiKey) {
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      this.geminiModel = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    }
  }

  // ── Helper: grade point → letter grade ────────────────────────────────────
  private gpToLetter(gp: number): string {
    if (gp >= 10) return 'A+';
    if (gp >= 9.0) return 'A+';
    if (gp >= 8.0) return 'A';
    if (gp >= 7.0) return 'B+';
    if (gp >= 6.0) return 'B';
    if (gp >= 5.0) return 'C+';
    if (gp >= 4.0) return 'C';
    return 'F';
  }

  // ── Tool: get_user_grades ──────────────────────────────────────────────────
  private async toolGetGrades(userId: string): Promise<string> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    const entries = await this.prisma.cgpaEntry.findMany({
      where: { userId },
      orderBy: [{ semester: 'asc' }, { createdAt: 'desc' }],
      select: {
        subjectName: true,
        courseCode: true,
        gradePoint: true,
        credits: true,
        semester: true,
        courseType: true,
      },
    });

    if (!entries || entries.length === 0) {
      return JSON.stringify({
        user: user?.name ?? null,
        CGPA: null,
        subjects: [],
        message: 'No grade entries found. Add grades in the CGPA tracker.',
      });
    }

    // De-duplicate: keep first occurrence per subject (already ordered by createdAt desc)
    const seen = new Set<string>();
    const subjects: Array<{
      code: string;
      name: string;
      grade: string;
      gradePoint: number;
      credits: number;
      semester: number;
      type: string;
    }> = [];

    let totalWeighted = 0;
    let totalCredits = 0;

    for (const e of entries) {
      const key = (e.subjectName || e.courseCode || 'Unknown').toLowerCase();
      const gp = Number(e.gradePoint ?? 0);
      const credits = Number(e.credits ?? 3);

      totalWeighted += gp * credits;
      totalCredits += credits;

      if (!seen.has(key)) {
        seen.add(key);
        subjects.push({
          code: e.courseCode ?? '—',
          name: e.subjectName ?? e.courseCode ?? 'Unknown',
          grade: this.gpToLetter(gp),
          gradePoint: gp,
          credits,
          semester: e.semester,
          type: e.courseType ?? 'core',
        });
      }
    }

    const cgpa = totalCredits > 0 ? Number((totalWeighted / totalCredits).toFixed(2)) : null;

    return JSON.stringify({ user: user?.name ?? null, CGPA: cgpa, subjects });
  }

  // ── Tool: get_user_attendance ──────────────────────────────────────────────
  private async toolGetAttendance(userId: string): Promise<string> {
    const TARGET = 75;

    // Use the existing repository method which already computes per-course stats
    const summary = await this.attendanceRepo.getStudentSummary(userId);

    if (!summary.courses || summary.courses.length === 0) {
      return JSON.stringify({
        totalSummary: { present: 0, total: 0, percentage: 0 },
        courses: [],
        message: 'No attendance records found yet.',
      });
    }

    const targetRatio = TARGET / 100;

    const enrichedCourses = summary.courses.map((course) => {
      const effectivePresent = course.present + course.late * 0.5;
      let needed = 0;
      let canSkip = 0;
      let statusMsg = '';

      if (course.percentage < TARGET) {
        needed = Math.ceil(
          (targetRatio * course.total - effectivePresent) / (1 - targetRatio),
        );
        needed = Math.max(0, needed);
        statusMsg = needed > 0 ? `Attend ${needed} more to reach 75%` : 'Borderline';
      } else {
        canSkip = Math.floor(effectivePresent / targetRatio - course.total);
        canSkip = Math.max(0, canSkip);
        statusMsg = canSkip > 0 ? `Safe to skip ${canSkip} classes` : 'Maintenance mode';
      }

      return {
        courseCode: course.courseCode,
        courseName: course.courseName,
        present: course.present,
        absent: course.absent,
        late: course.late,
        total: course.total,
        percentage: course.percentage,
        canSkip,
        needed,
        status: statusMsg,
      };
    });

    return JSON.stringify({
      totalSummary: summary.totalSummary,
      courses: enrichedCourses,
    });
  }

  // ── Tool: get_user_schedule ────────────────────────────────────────────────
  private async toolGetSchedule(userId: string): Promise<string> {
    // Fetch student profile for department + semester
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { department: true, semester: true },
    });

    // Also fetch enrolled course IDs so we can match timetable entries
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId: userId, status: 'active' },
      select: { courseId: true, courseCode: true, courseName: true, batch: true },
    });

    let timetableResult: { items: any[] };

    if (enrollments.length > 0) {
      // Prefer matching by courseId for precise results
      const courseIds = enrollments.map((e) => e.courseId);
      const allEntries: any[] = [];

      for (const courseId of courseIds) {
        const result = await this.timetableRepo.findMany({ courseId } as any);
        allEntries.push(...(result as any).items);
      }

      timetableResult = { items: allEntries };
    } else if (profile) {
      // Fallback: fetch by department + semester
      timetableResult = await this.timetableRepo.findMany({
        department: profile.department,
        semester: profile.semester,
      } as any) as any;
    } else {
      return JSON.stringify({
        message: 'No enrolled courses or student profile found.',
        schedule: [],
      });
    }

    const entries: any[] = (timetableResult as any).items ?? timetableResult;

    if (!entries || entries.length === 0) {
      return JSON.stringify({
        message: 'No timetable entries found for your courses yet.',
        schedule: [],
      });
    }

    // Group by day
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const grouped: Record<string, any[]> = {};

    for (const entry of entries) {
      const day = entry.day ?? 'Unknown';
      if (!grouped[day]) grouped[day] = [];
      grouped[day].push({
        startTime: entry.startTime,
        endTime: entry.endTime,
        courseCode: entry.courseCode,
        courseName: entry.courseName,
        room: entry.room ?? '—',
        facultyName: entry.facultyName ?? '—',
      });
    }

    // Sort entries within each day by startTime
    for (const day of Object.keys(grouped)) {
      grouped[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    const schedule = dayOrder
      .filter((d) => grouped[d])
      .map((d) => ({ day: d, entries: grouped[d] }));

    return JSON.stringify({ schedule });
  }

  // ── Main completion handler ────────────────────────────────────────────────
  async getCompletion(body: any, res: any, userId?: string) {
    if (!this.openaiClient) {
      throw new ServiceUnavailableException(
        'AI provider is not configured on the server.',
      );
    }

    try {
      const requestedModel =
        typeof body?.model === 'string' && body.model.trim().length > 0
          ? body.model.trim()
          : this.isGithubModelsProvider
            ? 'openai/gpt-4o-mini'
            : 'gpt-4o-mini';

      const resolvedModel =
        this.isGithubModelsProvider && !requestedModel.includes('/')
          ? `openai/${requestedModel}`
          : requestedModel;

      const tools = [
        {
          type: 'function',
          function: {
            name: 'get_user_schedule',
            description:
              "Get the current student's weekly class timetable grouped by day, including course name, code, room, faculty, and time slots.",
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_user_grades',
            description:
              "Get the current student's academic grades, grade points, credits, semesters, and computed CGPA from their transcript.",
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'search_college_notices',
            description:
              'Search for college notices, syllabus, announcements, or general institutional information.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'The search query' },
              },
              required: ['query'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_user_attendance',
            description:
              "Get the current student's per-subject attendance with percentage, classes present/absent, and whether they can skip or need to attend more to maintain 75%.",
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'search_marketplace',
            description:
              'Search the college marketplace for available items like books, electronics, etc.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'What to search for' },
              },
              required: ['query'],
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_upcoming_events',
            description:
              'Get upcoming college academic calendar events, holidays, exam schedules, and important dates.',
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'navigate_to_page',
            description:
              'Navigate the user to a specific page in the app. Use this whenever the user asks to go to, open, visit, or be taken to any section of the app.',
            parameters: {
              type: 'object',
              properties: {
                path: {
                  type: 'string',
                  enum: [
                    '/marketplace',
                    '/attendance',
                    '/grades',
                    '/timetable',
                    '/noticeboard',
                    '/canteen',
                    '/finance',
                    '/profile',
                    '/clubs',
                    '/hostel',
                    '/academic-calendar',
                    '/dashboard',
                  ],
                  description: 'The exact app path to navigate to',
                },
                pageName: {
                  type: 'string',
                  description: 'Human-readable name of the page (e.g. "Marketplace", "Attendance")',
                },
              },
              required: ['path', 'pageName'],
            },
          },
        },
      ] as const;

      let messages = [...body.messages];

      // First LLM call (sync) — let it decide which tools to call
      let response = await this.openaiClient.chat.completions.create({
        ...body,
        model: resolvedModel,
        messages,
        tools,
        tool_choice: 'auto',
        stream: false,
      });

      // Agentic loop — keep resolving tool calls until no more
      let responseMessage = response.choices[0].message;

      while (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        messages.push(responseMessage);

        for (const toolCall of responseMessage.tool_calls) {
          if (toolCall.type !== 'function') continue;

          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments || '{}');

          // Notify the frontend which tool is running
          res.write(`data: ${JSON.stringify({ tool: functionName })}\n\n`);

          let functionResult = '';

          if (functionName === 'get_user_grades') {
            if (userId) {
              functionResult = await this.toolGetGrades(userId);
              // Push parsed data directly to frontend — no need for model to emit UI tags
              res.write(`data: ${JSON.stringify({ gradesData: JSON.parse(functionResult) })}\n\n`);
              functionResult = JSON.stringify({
                displayed: true,
                message: 'The grades have been shown to the user in a formatted table. Write a short 1-2 sentence summary (e.g. CGPA, strongest subject). Do NOT repeat or list the raw data.',
              });
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'get_user_attendance') {
            if (userId) {
              functionResult = await this.toolGetAttendance(userId);
              // Push parsed data directly to frontend — no need for model to emit UI tags
              res.write(`data: ${JSON.stringify({ attendanceData: JSON.parse(functionResult) })}\n\n`);
              functionResult = JSON.stringify({
                displayed: true,
                message: 'The attendance report has been shown to the user in a formatted table with per-subject breakdown and skip/attend predictions. Write a short 1-2 sentence summary of their overall status. Do NOT repeat or list the raw data.',
              });
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'get_user_schedule') {
            if (userId) {
              functionResult = await this.toolGetSchedule(userId);
              // Push parsed data directly to frontend — no need for model to emit UI tags
              res.write(`data: ${JSON.stringify({ scheduleData: JSON.parse(functionResult) })}\n\n`);
              functionResult = JSON.stringify({
                displayed: true,
                message: 'The weekly timetable has been shown to the user in a formatted day-grouped schedule. Write a short 1-2 sentence summary (e.g. how many classes today). Do NOT repeat or list the raw data.',
              });
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'search_college_notices') {
            const results = await this.ragService.getCollegeNotices(functionArgs.query);
            functionResult = JSON.stringify(results);
          } else if (functionName === 'search_marketplace') {
            const listings = await this.prisma.marketplaceListing.findMany({
              where: {
                title: { contains: functionArgs.query, mode: 'insensitive' },
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
            functionResult = JSON.stringify(listings);
          } else if (functionName === 'get_upcoming_events') {
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
            functionResult = JSON.stringify(events);
          } else if (functionName === 'navigate_to_page') {
            const path = functionArgs.path ?? '/dashboard';
            const pageName = functionArgs.pageName ?? path;
            // Immediately fire the navigation event to the frontend
            res.write(`data: ${JSON.stringify({ navigate: path })}\n\n`);
            functionResult = JSON.stringify({ navigated: true, path, pageName });
          } else {
            functionResult = JSON.stringify({ error: `Unknown tool: ${functionName}` });
          }

          messages.push({
            tool_call_id: toolCall.id,
            role: 'tool',
            name: functionName,
            content: functionResult,
          } as any);
        }

        // Next LLM call — may call more tools or produce final answer
        response = await this.openaiClient.chat.completions.create({
          ...body,
          model: resolvedModel,
          messages,
          tools,
          tool_choice: 'auto',
          stream: false,
        });
        responseMessage = response.choices[0].message;
      }

      // ── Stream the final answer ─────────────────────────────────────────────
      // responseMessage.content already has the model's answer from the last
      // non-streaming call in the loop above. Re-using it avoids an extra API
      // round-trip and lets us write it character-by-character for a smooth
      // typewriter animation.

      const finalContent = responseMessage.content ?? '';

      if (finalContent.trim()) {
        res.write(`data: ${JSON.stringify({ text: finalContent })}\n\n`);
      } else {
        // Fallback: no cached content (shouldn't happen) — make a real streaming call
        const stream = await this.openaiClient.chat.completions.create({
          ...body,
          model: resolvedModel,
          messages,
          stream: true,
          tools: undefined,
          tool_choice: undefined,
        });
        for await (const chunk of stream as any) {
          const content = chunk.choices[0]?.delta?.content ?? '';
          if (content) {
            res.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        }
      }

      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error('[AI] Error:', error);
      res.write(`data: ${JSON.stringify({ error: error.message || 'AI request failed' })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
    }
  }

  // ── PDF calendar parser (unchanged) ───────────────────────────────────────
  async parseAcademicCalendarPdf(pdfBase64: string): Promise<any[]> {
    if (!this.geminiModel) {
      throw new InternalServerErrorException('Gemini API key is not configured.');
    }

    try {
      const pdfBuffer = Buffer.from(pdfBase64, 'base64');

      const prompt = `You are an expert at extracting academic calendar information from PDF documents. Analyze this academic calendar PDF and extract ALL events, holidays, exam schedules, and important dates.

Return ONLY a valid JSON array with the following structure for each event:
[
  {
    "title": "Event name/title",
    "description": "Detailed description of the event",
    "date": "YYYY-MM-DD format",
    "endDate": "YYYY-MM-DD format or null if single day",
    "startTime": "HH:MM or null if not specified",
    "endTime": "HH:MM or null if not specified",
    "eventType": "one of: holiday|exam|event|deadline|working-day|orientation|registration|result|recess",
    "category": "broader category like: academic|examination|holiday|administrative|cultural|sports|technical",
    "location": "venue or null if not specified",
    "importance": "one of: high|medium|low",
    "targetAudience": "who it applies to: all|students|faculty|specific-department or null"
  }
]

Rules:
1. Extract EVERY event and date mentioned in the calendar
2. Use the current academic year context (2025-2026) if years are not explicitly mentioned
3. For date ranges, create separate start and end dates
4. For recurring events, create individual entries
5. If a date is ambiguous, make your best guess based on context
6. Return ONLY the JSON array, no markdown formatting, no explanations
7. If no date is found for an event, skip it
8. Parse tables carefully - they often contain exam schedules`;

      const result = await this.geminiModel.generateContent([
        prompt,
        {
          inlineData: {
            data: pdfBuffer.toString('base64'),
            mimeType: 'application/pdf',
          },
        },
      ]);

      const response = await result.response;
      let text = response.text();

      // Clean up markdown code blocks if present
      text = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

      // Find JSON array in the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Could not parse calendar events from AI response');
      }

      const events = JSON.parse(jsonMatch[0]);
      return events;
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'Failed to parse academic calendar PDF',
      );
    }
  }
}
