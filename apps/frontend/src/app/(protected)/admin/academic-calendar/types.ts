export interface ParsedEvent {
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  eventType: string;
  category: string;
  location: string | null;
  importance: string;
  targetAudience: string | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  eventType: string;
  category: string;
  location: string | null;
  importance: string;
  targetAudience: string | null;
  rawData: any;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}
