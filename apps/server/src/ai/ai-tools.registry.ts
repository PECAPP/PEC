/**
 * Static OpenAI function-calling tool definitions.
 *
 * Each entry follows the OpenAI `ChatCompletionTool` schema. Keep this file
 * free of runtime logic — it is imported by AiOrchestrationService and
 * AiToolsService and must remain side-effect-free.
 */
export const TOOL_DEFINITIONS = [
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
            description:
              'Optional day of the week to get schedule for (e.g. "Monday", "Tuesday", etc.)',
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
              '/night-canteen',
              '/finance',
              '/profile',
              '/clubs',
              '/hostel-issues',
              '/academic-calendar',
              '/examinations',
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
              '- /canteen: Order food, check day canteen menu, or snacks.\n' +
              '- /night-canteen: Order food after-hours, check night canteen menu.\n' +
              '- /finance: Pay college/hostel/mess fees, view pending dues, billing, or transaction receipts.\n' +
              '- /profile: Update user profile, student bio, sync GitHub/LinkedIn.\n' +
              '- /clubs: Student clubs, joining requests, or student activities.\n' +
              '- /hostel-issues: Hostel maintenance reporting, file complaints (plumbing, electrical, wifi), or room issues.\n' +
              '- /academic-calendar: Holidays list, recess dates, semester dates, or calendar events.\n' +
              '- /examinations: View upcoming exam schedules, exam timetable, or exam hall details.\n' +
              '- /campus-map: Look at campus 2D/3D maps, buildings, roads, or spatial navigation.\n' +
              '- /resume-builder: Build professional resumes with AI analyzer.\n' +
              '- /student-portfolio: Student project showcase, skills portfolio, or portfolio editor.\n' +
              '- /rooms: Check available rooms, lecture halls, labs, or building occupancy.\n' +
              '- /dashboard: Overview dashboard, central command center, or home page.',
          },
          pageName: {
            type: 'string',
            description:
              'Human-readable name of the page (e.g. "Marketplace", "Attendance")',
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
        'Get the current canteen menu with items, prices, and categories. Optionally filter by category.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description:
              'Optional category of canteen items to filter by (e.g. "Beverages", "Snacks")',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_clubs',
      description: 'Get the list of college student clubs.',
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_upcoming_exams',
      description:
        "Get the student's upcoming exam schedule scoped to their department — includes course code, name, exam type (midterm/final/quiz/lab), date, time, and room.",
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_finance_summary',
      description:
        "Get the student's fee payment summary: total pending amount, total paid, number of overdue fees, and a breakdown of pending fees by category (tuition, hostel, mess, etc.).",
      parameters: { type: 'object', properties: {} },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_night_canteen_menu',
      description:
        'Get the after-hours night canteen menu with available items, prices, and categories. Use this when the user asks about night canteen ordering or late-night food.',
      parameters: {
        type: 'object',
        properties: {
          category: {
            type: 'string',
            description: 'Optional category to filter by (e.g. "Snacks", "Beverages")',
          },
        },
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_enrolled_courses',
      description:
        "Get the list of courses the student is currently enrolled in, including course name, code, semester, and batch.",
      parameters: { type: 'object', properties: {} },
    },
  },
] as const;

export type ToolName =
  | 'get_user_schedule'
  | 'get_user_grades'
  | 'search_college_notices'
  | 'get_user_attendance'
  | 'search_marketplace'
  | 'get_upcoming_events'
  | 'navigate_to_page'
  | 'get_hostel_issues'
  | 'get_canteen_menu'
  | 'get_clubs'
  | 'get_upcoming_exams'
  | 'get_finance_summary'
  | 'get_night_canteen_menu'
  | 'get_enrolled_courses';
