export const EVENT_COLORS: Record<string, string> = {
  holiday: 'bg-[hsl(160,84%,39%,0.1)] text-[hsl(160,84%,39%)] border-[hsl(160,84%,39%,0.2)] dark:bg-[hsl(160,70%,42%,0.2)] dark:text-[hsl(160,70%,42%)] dark:border-[hsl(160,70%,42%,0.3)]',
  exam: 'bg-[hsl(0,72%,51%,0.1)] text-[hsl(0,72%,51%)] border-[hsl(0,72%,51%,0.2)] dark:bg-[hsl(0,62%,55%,0.2)] dark:text-[hsl(0,62%,55%)] dark:border-[hsl(0,62%,55%,0.3)]',
  event: 'bg-[hsl(220,90%,45%,0.1)] text-[hsl(220,90%,45%)] border-[hsl(220,90%,45%,0.2)] dark:bg-[hsl(220,90%,56%,0.2)] dark:text-[hsl(220,90%,56%)] dark:border-[hsl(220,90%,56%,0.3)]',
  deadline: 'bg-[hsl(38,92%,50%,0.1)] text-[hsl(38,92%,50%)] border-[hsl(38,92%,50%,0.2)] dark:bg-[hsl(38,92%,50%,0.2)] dark:text-[hsl(38,92%,50%)] dark:border-[hsl(38,92%,50%,0.3)]',
  'working-day': 'bg-[hsl(180,60%,45%,0.1)] text-[hsl(180,60%,45%)] border-[hsl(180,60%,45%,0.2)] dark:bg-[hsl(180,50%,55%,0.2)] dark:text-[hsl(180,50%,55%)] dark:border-[hsl(180,50%,55%,0.3)]',
  orientation: 'bg-[hsl(190,90%,45%,0.1)] text-[hsl(190,90%,45%)] border-[hsl(190,90%,45%,0.2)] dark:bg-[hsl(190,80%,55%,0.2)] dark:text-[hsl(190,80%,55%)] dark:border-[hsl(190,80%,55%,0.3)]',
  registration: 'bg-[hsl(270,70%,50%,0.1)] text-[hsl(270,70%,50%)] border-[hsl(270,70%,50%,0.2)] dark:bg-[hsl(270,70%,60%,0.2)] dark:text-[hsl(270,70%,60%)] dark:border-[hsl(270,70%,60%,0.3)]',
  result: 'bg-[hsl(46,95%,42%,0.1)] text-[hsl(46,95%,42%)] border-[hsl(46,95%,42%,0.2)] dark:bg-[hsl(46,95%,56%,0.2)] dark:text-[hsl(46,95%,56%)] dark:border-[hsl(46,95%,56%,0.3)]',
  recess: 'bg-[hsl(220,10%,45%,0.1)] text-[hsl(220,10%,45%)] border-[hsl(220,10%,45%,0.2)] dark:bg-[hsl(220,10%,60%,0.2)] dark:text-[hsl(220,10%,60%)] dark:border-[hsl(220,10%,60%,0.3)]',
};

export const EVENT_DOT_COLORS: Record<string, string> = {
  holiday: 'bg-[hsl(160,84%,39%)] shadow-[0_0_10px_rgba(16,185,129,0.5)]',
  exam: 'bg-[hsl(0,72%,51%)] shadow-[0_0_10px_rgba(239,68,68,0.5)]',
  event: 'bg-[hsl(220,90%,45%)] shadow-[0_0_10px_rgba(59,130,246,0.5)]',
  deadline: 'bg-[hsl(38,92%,50%)] shadow-[0_0_10px_rgba(245,158,11,0.5)]',
  'working-day': 'bg-[hsl(180,60%,45%)] shadow-[0_0_10px_rgba(20,184,166,0.5)]',
  orientation: 'bg-[hsl(190,90%,45%)] shadow-[0_0_10px_rgba(6,182,212,0.5)]',
  registration: 'bg-[hsl(270,70%,50%)] shadow-[0_0_10px_rgba(168,85,247,0.5)]',
  result: 'bg-[hsl(46,95%,42%)] shadow-[0_0_10px_rgba(234,179,8,0.5)]',
  recess: 'bg-[hsl(220,10%,45%)] shadow-[0_0_10px_rgba(100,116,139,0.5)]',
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
