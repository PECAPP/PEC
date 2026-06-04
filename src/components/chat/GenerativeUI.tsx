import React from 'react';
import {
  BookOpen,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  Minus,
  Award,
  AlertTriangle,
} from 'lucide-react';

// ─── Grades Table ─────────────────────────────────────────────────────────────

interface GradeSubject {
  code: string;
  name: string;
  grade: string;
  gradePoint: number;
  credits: number;
  semester: number;
  type?: string;
}

interface GradesData {
  user?: string | null;
  CGPA?: number | null;
  subjects?: GradeSubject[];
  message?: string;
}

const gradeColor = (grade: string) => {
  if (['A+', 'A'].includes(grade)) return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40';
  if (['B+', 'B'].includes(grade)) return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40';
  if (['C+', 'C'].includes(grade)) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40';
  return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40';
};

const cgpaBadgeColor = (cgpa: number) => {
  if (cgpa >= 8) return 'bg-emerald-600';
  if (cgpa >= 6.5) return 'bg-blue-600';
  if (cgpa >= 5) return 'bg-amber-500';
  return 'bg-red-600';
};

export const GradesTable = ({ data }: { data: GradesData }) => {
  if (!data) return null;

  const subjects = data.subjects ?? [];
  const cgpa = data.CGPA;

  if (subjects.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        {data.message ?? 'No grade records found.'}
      </div>
    );
  }

  const totalCredits = subjects.reduce((s, e) => s + e.credits, 0);

  // Group by semester
  const bySem: Record<number, GradeSubject[]> = {};
  for (const s of subjects) {
    if (!bySem[s.semester]) bySem[s.semester] = [];
    bySem[s.semester].push(s);
  }
  const semesters = Object.keys(bySem)
    .map(Number)
    .sort((a, b) => a - b);

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <BookOpen className="w-4 h-4" />
          <span className="font-semibold text-sm">
            Academic Transcript{data.user ? ` — ${data.user}` : ''}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-indigo-200 text-xs">{totalCredits} credits</span>
          {cgpa !== null && cgpa !== undefined && (
            <span className={`text-white text-xs font-bold px-2.5 py-1 rounded-full ${cgpaBadgeColor(cgpa)}`}>
              CGPA {cgpa}
            </span>
          )}
        </div>
      </div>

      {/* Per-semester sections */}
      {semesters.map((sem) => (
        <div key={sem}>
          <div className="bg-gray-50 dark:bg-gray-900/40 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
            Semester {sem}
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[11px] text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
                <th className="text-left px-4 py-2 font-medium">Subject</th>
                <th className="text-center px-2 py-2 font-medium">Code</th>
                <th className="text-center px-2 py-2 font-medium">GP</th>
                <th className="text-center px-2 py-2 font-medium">Cr</th>
                <th className="text-center px-3 py-2 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {bySem[sem].map((s, idx) => (
                <tr
                  key={idx}
                  className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-indigo-50/40 dark:hover:bg-indigo-900/10 transition-colors"
                >
                  <td className="px-4 py-2.5 text-gray-800 dark:text-gray-200 font-medium truncate max-w-[120px]" title={s.name}>
                    {s.name}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {s.code}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-600 dark:text-gray-300 font-medium">
                    {s.gradePoint.toFixed(1)}
                  </td>
                  <td className="px-2 py-2.5 text-center text-gray-500 dark:text-gray-400">
                    {s.credits}
                  </td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded-md ${gradeColor(s.grade)}`}>
                      {s.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Footer */}
      <div className="bg-gray-50 dark:bg-gray-900/30 px-4 py-2.5 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700">
        <span>{subjects.length} subjects · {totalCredits} total credits</span>
        {cgpa !== null && cgpa !== undefined && (
          <span className="font-bold text-indigo-600 dark:text-indigo-400">CGPA: {cgpa}</span>
        )}
      </div>
    </div>
  );
};

// ─── Attendance Table ─────────────────────────────────────────────────────────

interface AttendanceCourse {
  courseCode: string;
  courseName: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
  canSkip: number;
  needed: number;
  status: string;
}

interface AttendanceData {
  totalSummary?: { present: number; total: number; percentage: number };
  courses?: AttendanceCourse[];
  message?: string;
  records?: any[]; // legacy fallback
}

const attendanceRowColor = (pct: number) => {
  if (pct >= 85) return 'bg-emerald-50 dark:bg-emerald-900/10';
  if (pct >= 75) return 'bg-blue-50 dark:bg-blue-900/10';
  if (pct >= 65) return 'bg-amber-50 dark:bg-amber-900/10';
  return 'bg-red-50 dark:bg-red-900/10';
};

const attendanceBadge = (pct: number) => {
  if (pct >= 85) return 'text-emerald-700 bg-emerald-100 dark:text-emerald-300 dark:bg-emerald-900/40';
  if (pct >= 75) return 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-900/40';
  if (pct >= 65) return 'text-amber-700 bg-amber-100 dark:text-amber-300 dark:bg-amber-900/40';
  return 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-900/40';
};

const progressBar = (pct: number) => {
  const clamp = Math.min(100, Math.max(0, pct));
  const color = pct >= 85 ? 'bg-emerald-500' : pct >= 75 ? 'bg-blue-500' : pct >= 65 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-1">
      <div className={`h-1.5 rounded-full transition-all ${color}`} style={{ width: `${clamp}%` }} />
    </div>
  );
};

export const AttendanceTable = ({ data }: { data: AttendanceData }) => {
  if (!data) return null;

  // Legacy fallback: if old format with records[]
  if (!data.courses && data.records) {
    const records = data.records;
    const total = records.length;
    const present = records.filter((r: any) => r.status === 'present').length;
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
    const isGood = percentage >= 75;
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden my-3">
        <div className={`${isGood ? 'bg-emerald-600' : 'bg-red-600'} px-4 py-3 flex items-center justify-between text-white`}>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span className="font-semibold text-sm">Attendance Summary</span>
          </div>
          <span className="font-bold text-sm">{percentage}%</span>
        </div>
        <div className="p-3 text-xs text-gray-500 dark:text-gray-400">
          {present}/{total} classes attended
        </div>
      </div>
    );
  }

  const courses = data.courses ?? [];
  const total = data.totalSummary;

  if (courses.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        {data.message ?? 'No attendance records found.'}
      </div>
    );
  }

  const overallPct = total?.percentage ?? 0;
  const overallColor = overallPct >= 75 ? 'from-emerald-600 to-teal-600' : 'from-red-600 to-rose-600';

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      {/* Header */}
      <div className={`bg-gradient-to-r ${overallColor} px-4 py-3 flex items-center justify-between text-white`}>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-semibold text-sm">Attendance Report</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-white/80 text-xs">{total?.present ?? 0}/{total?.total ?? 0} classes</span>
          <span className="font-bold bg-white/20 px-2 py-0.5 rounded-full">{overallPct}% overall</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <div className="px-4 pt-2 pb-1">
        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
          <span>Overall attendance</span>
          <span className={overallPct >= 75 ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
            {overallPct >= 75 ? '✓ Above 75% threshold' : '⚠ Below 75% threshold'}
          </span>
        </div>
        {progressBar(overallPct)}
      </div>

      {/* Per-course table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm mt-2">
          <thead>
            <tr className="text-[11px] text-gray-400 dark:text-gray-500 uppercase border-b border-gray-100 dark:border-gray-700">
              <th className="text-left px-4 py-2 font-medium">Course</th>
              <th className="text-center px-2 py-2 font-medium">P</th>
              <th className="text-center px-2 py-2 font-medium">A</th>
              <th className="text-center px-2 py-2 font-medium">L</th>
              <th className="text-center px-2 py-2 font-medium">Total</th>
              <th className="text-left px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {courses.map((c, idx) => (
              <tr
                key={idx}
                className={`border-b border-gray-50 dark:border-gray-700/50 ${attendanceRowColor(c.percentage)}`}
              >
                <td className="px-4 py-2.5">
                  <div className="font-medium text-gray-800 dark:text-gray-200 text-xs leading-tight truncate max-w-[110px]" title={c.courseName}>
                    {c.courseName}
                  </div>
                  <div className="text-[10px] text-gray-400 font-mono">{c.courseCode}</div>
                  {progressBar(c.percentage)}
                </td>
                <td className="px-2 py-2.5 text-center text-emerald-600 dark:text-emerald-400 font-medium text-xs">{c.present}</td>
                <td className="px-2 py-2.5 text-center text-red-500 dark:text-red-400 font-medium text-xs">{c.absent}</td>
                <td className="px-2 py-2.5 text-center text-amber-500 dark:text-amber-400 font-medium text-xs">{c.late}</td>
                <td className="px-2 py-2.5 text-center">
                  <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${attendanceBadge(c.percentage)}`}>
                    {c.percentage}%
                  </span>
                </td>
                <td className="px-3 py-2.5">
                  {c.canSkip > 0 ? (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium whitespace-nowrap">
                      <TrendingUp className="w-3 h-3" /> Skip {c.canSkip}
                    </span>
                  ) : c.needed > 0 ? (
                    <span className="flex items-center gap-1 text-red-600 dark:text-red-400 text-[11px] font-medium whitespace-nowrap">
                      <AlertTriangle className="w-3 h-3" /> Need {c.needed}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-gray-500 text-[11px] whitespace-nowrap">
                      <Minus className="w-3 h-3" /> Borderline
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 dark:bg-gray-900/30 px-4 py-2 text-[10px] text-gray-400 border-t border-gray-100 dark:border-gray-700 flex gap-3 flex-wrap">
        <span>P = Present · A = Absent · L = Late (0.5 credit)</span>
      </div>
    </div>
  );
};

// ─── Schedule Table ───────────────────────────────────────────────────────────

interface ScheduleEntry {
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  room: string;
  facultyName: string;
}

interface ScheduleDay {
  day: string;
  entries: ScheduleEntry[];
}

interface ScheduleData {
  schedule?: ScheduleDay[];
  message?: string;
}

const DAY_COLORS: Record<string, string> = {
  Monday: 'from-indigo-600 to-blue-600',
  Tuesday: 'from-violet-600 to-purple-600',
  Wednesday: 'from-teal-600 to-emerald-600',
  Thursday: 'from-orange-600 to-amber-600',
  Friday: 'from-pink-600 to-rose-600',
  Saturday: 'from-slate-600 to-gray-600',
  Sunday: 'from-red-600 to-rose-700',
};

const todayName = () => {
  return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
    new Date().getDay()
  ];
};

export const ScheduleTable = ({ data }: { data: ScheduleData }) => {
  if (!data) return null;

  const schedule = data.schedule ?? [];
  const today = todayName();

  if (schedule.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        {data.message ?? 'No timetable entries found.'}
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span className="font-semibold text-sm">Weekly Timetable</span>
        </div>
        <span className="text-xs text-slate-300 bg-slate-600 px-2 py-0.5 rounded-full">
          Today: {today}
        </span>
      </div>

      {/* Day sections */}
      {schedule.map(({ day, entries }) => {
        const isToday = day === today;
        const gradient = DAY_COLORS[day] ?? 'from-gray-500 to-gray-600';

        return (
          <div key={day} className={isToday ? 'ring-2 ring-inset ring-indigo-400/30' : ''}>
            <div className={`bg-gradient-to-r ${gradient} px-4 py-1.5 flex items-center gap-2`}>
              <span className="text-white text-xs font-semibold uppercase tracking-wide">{day}</span>
              {isToday && (
                <span className="text-[10px] bg-white/20 text-white px-1.5 py-0.5 rounded-full font-medium">
                  Today
                </span>
              )}
            </div>
            <table className="w-full text-sm">
              <tbody>
                {entries.map((e, idx) => (
                  <tr
                    key={idx}
                    className={`border-b border-gray-50 dark:border-gray-700/40 ${isToday ? 'hover:bg-indigo-50/60 dark:hover:bg-indigo-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/20'} transition-colors`}
                  >
                    <td className="px-3 py-2.5 w-24">
                      <div className="text-gray-800 dark:text-gray-200 font-mono text-[11px] font-semibold">
                        {e.startTime}
                      </div>
                      <div className="text-gray-400 dark:text-gray-500 font-mono text-[10px]">
                        {e.endTime}
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-gray-800 dark:text-gray-200 text-xs leading-tight">
                        {e.courseName}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">{e.courseCode}</div>
                    </td>
                    <td className="px-2 py-2.5 text-right">
                      <div className="flex flex-col items-end gap-0.5">
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 dark:text-gray-400">
                          <MapPin className="w-2.5 h-2.5" /> {e.room}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
                          <User className="w-2.5 h-2.5" /> {e.facultyName}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

// ─── Suggestion Chips ─────────────────────────────────────────────────────────

export const SuggestionChips = ({
  chips,
  onSelect,
}: {
  chips: string[];
  onSelect: (text: string) => void;
}) => {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          onClick={() => onSelect(chip)}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full transition-all duration-150 border border-indigo-100 dark:border-indigo-800/50 hover:scale-105 active:scale-95 shadow-sm"
        >
          {chip}
        </button>
      ))}
    </div>
  );
};
