export const EVENT_COLORS: Record<string, string> = {
  holiday: 'bg-rose-500/10 text-rose-600 border-rose-200/50 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800/50',
  exam: 'bg-violet-500/10 text-violet-600 border-violet-200/50 dark:bg-violet-900/20 dark:text-violet-400 dark:border-violet-800/50',
  event: 'bg-blue-500/10 text-blue-600 border-blue-200/50 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/50',
  deadline: 'bg-amber-500/10 text-amber-600 border-amber-200/50 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
  'working-day': 'bg-emerald-500/10 text-emerald-600 border-emerald-200/50 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800/50',
  orientation: 'bg-cyan-500/10 text-cyan-600 border-cyan-200/50 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-800/50',
  registration: 'bg-indigo-500/10 text-indigo-600 border-indigo-200/50 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800/50',
  result: 'bg-yellow-500/10 text-yellow-600 border-yellow-200/50 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/50',
  recess: 'bg-fuchsia-500/10 text-fuchsia-600 border-fuchsia-200/50 dark:bg-fuchsia-900/20 dark:text-fuchsia-400 dark:border-fuchsia-800/50',
};

export const EVENT_DOT_COLORS: Record<string, string> = {
  holiday: 'bg-rose-500 shadow-[0_0_8px_-1px_rgba(244,63,94,0.6)]',
  exam: 'bg-violet-500 shadow-[0_0_8px_-1px_rgba(139,92,246,0.6)]',
  event: 'bg-blue-500 shadow-[0_0_8px_-1px_rgba(59,130,246,0.6)]',
  deadline: 'bg-amber-500 shadow-[0_0_8px_-1px_rgba(245,158,11,0.6)]',
  'working-day': 'bg-emerald-500 shadow-[0_0_8px_-1px_rgba(16,185,129,0.6)]',
  orientation: 'bg-cyan-500 shadow-[0_0_8px_-1px_rgba(6,182,212,0.6)]',
  registration: 'bg-indigo-500 shadow-[0_0_8px_-1px_rgba(99,102,241,0.6)]',
  result: 'bg-yellow-500 shadow-[0_0_8px_-1px_rgba(234,179,8,0.6)]',
  recess: 'bg-fuchsia-500 shadow-[0_0_8px_-1px_rgba(217,70,239,0.6)]',
};

export const EVENT_LABELS: Record<string, string> = {
  holiday: 'Holiday',
  exam: 'Exam',
  event: 'Event',
  deadline: 'Deadline',
  'working-day': 'Working Day',
  orientation: 'Orientation',
  registration: 'Registration',
  result: 'Result',
  recess: 'Recess',
};

export const CATEGORY_LABELS: Record<string, string> = {
  academic: 'Academic',
  examination: 'Examination',
  holiday: 'Holiday',
  administrative: 'Administrative',
  cultural: 'Cultural',
  sports: 'Sports',
  technical: 'Technical',
};

export const IMPORTANCE_COLORS: Record<string, string> = {
  high: 'text-red-600 dark:text-red-400',
  medium: 'text-yellow-600 dark:text-yellow-400',
  low: 'text-green-600 dark:text-green-400',
};

export function getEventColor(eventType: string): string {
  return EVENT_COLORS[eventType] || EVENT_COLORS.event;
}

export function getEventDotColor(eventType: string): string {
  return EVENT_DOT_COLORS[eventType] || EVENT_DOT_COLORS.event;
}

export function getEventLabel(eventType: string): string {
  return EVENT_LABELS[eventType] || eventType;
}
