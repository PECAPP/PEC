import React from 'react';
import { Clock, MapPin, User } from 'lucide-react';

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
