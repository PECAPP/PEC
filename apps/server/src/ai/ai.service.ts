import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
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

    const entries = await this.prisma.cgpaEntry.findMany({ take: 1000, 
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
  private async toolGetSchedule(
    userId: string,
    day?: string,
    courseCode?: string,
    startTime?: string,
  ): Promise<string> {
    // Fetch student profile for department + semester
    const profile = await this.prisma.studentProfile.findUnique({
      where: { userId },
      select: { department: true, semester: true },
    });

    // Also fetch enrolled course IDs so we can match timetable entries
    const enrollments = await this.prisma.enrollment.findMany({ take: 1000, 
      where: { studentId: userId, status: 'active' },
      select: { courseId: true, courseCode: true, courseName: true, batch: true },
    });

    let timetableResult: { items: any[] };

    if (enrollments.length > 0) {
      // Prefer matching by courseId for precise results
      const courseIds = enrollments.map((e) => e.courseId);
      const allEntries: any[] = [];

      for (const courseId of courseIds) {
        const result = await this.timetableRepo.findMany({ take: 1000,  courseId } as any);
        allEntries.push(...(result as any).items);
      }

      timetableResult = { items: allEntries };
    } else if (profile) {
      // Fallback: fetch by department + semester
      timetableResult = await this.timetableRepo.findMany({ take: 1000, 
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
      const entryDay = entry.day ?? 'Unknown';

      // Apply dynamic filters based on user request
      if (day && entryDay.toLowerCase() !== day.toLowerCase()) {
        continue;
      }
      if (courseCode && entry.courseCode.toLowerCase() !== courseCode.toLowerCase()) {
        continue;
      }
      if (startTime && !entry.startTime.includes(startTime)) {
        continue;
      }

      if (!grouped[entryDay]) grouped[entryDay] = [];
      grouped[entryDay].push({
        startTime: entry.startTime,
        endTime: entry.endTime,
        courseCode: entry.courseCode,
        courseName: entry.courseName,
        room: entry.room ?? '—',
        facultyName: entry.facultyName ?? '—',
      });
    }

    // Sort entries within each day by startTime
    for (const d of Object.keys(grouped)) {
      grouped[d].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    const schedule = dayOrder
      .filter((d) => grouped[d] && grouped[d].length > 0)
      .map((d) => ({ day: d, entries: grouped[d] }));

    if (schedule.length === 0) {
      return JSON.stringify({
        message: 'No timetable entries found matching your specified filters.',
        schedule: [],
      });
    }

    return JSON.stringify({ schedule });
  }

  // ── Tool: get_hostel_issues ────────────────────────────────────────────────
  private async toolGetHostelIssues(userId: string): Promise<string> {
    try {
      const issues = await this.prisma.hostelIssue.findMany({ take: 1000, 
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

  // ── Tool: get_canteen_menu ──────────────────────────────────────────────────
  private async toolGetCanteenMenu(category?: string): Promise<string> {
    try {
      const items = await this.prisma.canteenItem.findMany({ take: 1000, 
        where: {
          isAvailable: true,
          ...(category ? { category: { contains: category, mode: 'insensitive' } } : {}),
        },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        take: 25,
        select: {
          name: true,
          price: true,
          category: true,
          description: true,
          stock: true,
        },
      });
      return JSON.stringify({ items });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch canteen menu: ' + err.message });
    }
  }

  // ── Tool: get_clubs ────────────────────────────────────────────────────────
  private async toolGetClubs(): Promise<string> {
    try {
      const clubs = await this.prisma.club.findMany({ take: 1000, 
        orderBy: { name: 'asc' },
        select: {
          name: true,
          createdAt: true,
        },
      });
      return JSON.stringify({ clubs });
    } catch (err) {
      return JSON.stringify({ error: 'Failed to fetch clubs: ' + err.message });
    }
  }

  // ── Main completion handler ────────────────────────────────────────────────
  async getCompletion(body: any, res: FastifyReply, userId?: string) {
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
              "Get the current student's class timetable, with optional parameters to filter by day, course code, or start time.",
            parameters: {
              type: 'object',
              properties: {
                day: {
                  type: 'string',
                  description: 'Optional day of the week to get schedule for (e.g. "Monday", "Tuesday", etc.)',
                },
                courseCode: {
                  type: 'string',
                  description: 'Optional course code to filter by (e.g. "CS301")',
                },
                startTime: {
                  type: 'string',
                  description: 'Optional start time to filter by (e.g. "09:00", "10:30")',
                },
              },
            },
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
                    '/score-sheet',
                    '/timetable',
                    '/noticeboard',
                    '/canteen',
                    '/finance',
                    '/profile',
                    '/clubs',
                    '/hostel-issues',
                    '/academic-calendar',
                    '/dashboard',
                    '/campus-map',
                    '/resume-builder',
                    '/student-portfolio',
                    '/rooms',
                  ],
                  description:
                    'The exact app path to navigate to. Maps informal requests as follows:\n' +
                    '- /marketplace: Buy/sell items, bookstore, trading, or shopping.\n' +
                    '- /attendance: View presence, skip classes limits, or attendance percentage.\n' +
                    '- /score-sheet: Check SGPA/CGPA, exam scores, grades, marks, or transcripts.\n' +
                    '- /timetable: Class schedule, lecture timings, daily lectures, or class slots.\n' +
                    '- /noticeboard: College notices, bulletins, official announcements, or pinboard.\n' +
                    '- /canteen: Order food, check canteen menu, snacks, or night canteen.\n' +
                    '- /finance: Pay college/hostel/mess fees, view pending dues, billing, or transaction receipts.\n' +
                    '- /profile: Update user profile, student bio, sync GitHub/LinkedIn.\n' +
                    '- /clubs: Student clubs, joining requests, or student activities.\n' +
                    '- /hostel-issues: Hostel maintenance reporting, file complaints (plumbing, electrical, wifi), or room issues.\n' +
                    '- /academic-calendar: Holidays list, recess dates, semester dates, or calendar events.\n' +
                    '- /campus-map: Look at campus 2D/3D maps, buildings, roads, or spatial navigation.\n' +
                    '- /resume-builder: Build professional resumes with AI analyzer.\n' +
                    '- /student-portfolio: Student project showcase, skills portfolio, or portfolio editor.\n' +
                    '- /rooms: Check available rooms, lecture halls, labs, or building occupancy.\n' +
                    '- /dashboard: Overview dashboard, central command center, or home page.',
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
        {
          type: 'function',
          function: {
            name: 'get_hostel_issues',
            description:
              "Get the list of hostel maintenance issues reported by the student, showing status, priority, description, and creation time.",
            parameters: { type: 'object', properties: {} },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_canteen_menu',
            description:
              "Get the current canteen menu with items, prices, and categories. Optionally filter by category.",
            parameters: {
              type: 'object',
              properties: {
                category: {
                  type: 'string',
                  description: 'Optional category of canteen items to filter by (e.g. "Beverages", "Snacks")',
                },
              },
            },
          },
        },
        {
          type: 'function',
          function: {
            name: 'get_clubs',
            description:
              "Get the list of college student clubs.",
            parameters: { type: 'object', properties: {} },
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
          let functionArgs: any = {};
          try {
            functionArgs = JSON.parse(toolCall.function.arguments || '{}');
          } catch (e) {
            console.error('[AI] Failed to parse tool arguments:', e);
          }

          // Notify the frontend which tool is running
          res.raw.write(`data: ${JSON.stringify({ tool: functionName })}\n\n`);

          let functionResult = '';

          if (functionName === 'get_user_grades') {
            if (userId) {
              functionResult = await this.toolGetGrades(userId);
              // Push parsed data directly to frontend — no need for model to emit UI tags
              let parsedResult = null;
              try { parsedResult = JSON.parse(functionResult); } catch (e) { parsedResult = null; }
              res.raw.write(`data: ${JSON.stringify({ gradesData: parsedResult })}\n\n`);
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
              let parsedResult = null;
              try { parsedResult = JSON.parse(functionResult); } catch (e) { parsedResult = null; }
              res.raw.write(`data: ${JSON.stringify({ attendanceData: parsedResult })}\n\n`);
              functionResult = JSON.stringify({
                displayed: true,
                message: 'The attendance report has been shown to the user in a formatted table with per-subject breakdown and skip/attend predictions. Write a short 1-2 sentence summary of their overall status. Do NOT repeat or list the raw data.',
              });
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'get_user_schedule') {
            if (userId) {
              functionResult = await this.toolGetSchedule(
                userId,
                functionArgs.day,
                functionArgs.courseCode,
                functionArgs.startTime,
              );
              // Push parsed data directly to frontend — no need for model to emit UI tags
              let parsedResult = null;
              try { parsedResult = JSON.parse(functionResult); } catch (e) { parsedResult = null; }
              res.raw.write(`data: ${JSON.stringify({ scheduleData: parsedResult })}\n\n`);
              functionResult = JSON.stringify({
                displayed: true,
                message: 'The filtered weekly timetable has been shown to the user in a formatted day-grouped schedule. Write a short 1-2 sentence summary. Do NOT repeat or list the raw data.',
              });
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'get_hostel_issues') {
            if (userId) {
              functionResult = await this.toolGetHostelIssues(userId);
            } else {
              functionResult = JSON.stringify({ error: 'User not authenticated' });
            }
          } else if (functionName === 'get_canteen_menu') {
            functionResult = await this.toolGetCanteenMenu(functionArgs.category);
          } else if (functionName === 'get_clubs') {
            functionResult = await this.toolGetClubs();
          } else if (functionName === 'search_college_notices') {
            const results = await this.ragService.getCollegeNotices(functionArgs.query);
            functionResult = JSON.stringify(results);
          } else if (functionName === 'search_marketplace') {
            const listings = await this.prisma.marketplaceListing.findMany({ take: 1000, 
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
            const events = await this.prisma.academicCalendarEvent.findMany({ take: 1000, 
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
            res.raw.write(`data: ${JSON.stringify({ navigate: path })}\n\n`);
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
        res.raw.write(`data: ${JSON.stringify({ text: finalContent })}\n\n`);
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
            res.raw.write(`data: ${JSON.stringify({ text: content })}\n\n`);
          }
        }
      }

      res.raw.write('data: [DONE]\n\n');
      res.raw.end();
    } catch (error) {
      console.error('[AI] Error:', error);
      res.raw.write(`data: ${JSON.stringify({ error: error.message || 'AI request failed' })}\n\n`);
      res.raw.write('data: [DONE]\n\n');
      res.raw.end();
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
