export const EVENT_COLORS: Record<string, string> = {
  holiday: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700',
  exam: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  event: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  deadline: 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  'working-day': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  orientation: 'bg-cyan-100 text-cyan-800 border-cyan-300 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  registration: 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-700',
  result: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  recess: 'bg-pink-100 text-pink-800 border-pink-300 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
};

export const EVENT_DOT_COLORS: Record<string, string> = {
  holiday: 'bg-red-500',
  exam: 'bg-purple-500',
  event: 'bg-blue-500',
  deadline: 'bg-orange-500',
  'working-day': 'bg-green-500',
  orientation: 'bg-cyan-500',
  registration: 'bg-indigo-500',
  result: 'bg-yellow-500',
  recess: 'bg-pink-500',
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
