export interface BaseEventAttributes {
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

export interface ParsedEvent extends BaseEventAttributes {}

export interface CalendarEvent extends BaseEventAttributes {
  id: string;
  rawData: any;
  isEditable: boolean;
  createdAt: string;
  updatedAt: string;
}
