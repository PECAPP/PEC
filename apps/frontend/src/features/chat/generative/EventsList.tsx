import { formatDate } from "@pec/ui";
import React from 'react';
import { Calendar } from 'lucide-react';

interface CalendarEvent {
  title: string;
  description: string;
  date: string;
  eventType: string;
  importance: string;
}

interface EventsData {
  events?: CalendarEvent[];
}

export const EventsList = ({ data }: { data: EventsData }) => {
  if (!data) return null;
  const events = data.events ?? [];

  if (events.length === 0) {
    return (
      <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-sm p-5 my-3 text-center text-sm text-gray-500">
        No upcoming calendar events.
      </div>
    );
  }

  const getEventTypeStyle = (type: string) => {
    switch (type.toLowerCase()) {
      case 'exam':
        return 'border-red-400 text-red-600 dark:text-red-400 dark:border-red-900/30';
      case 'holiday':
        return 'border-emerald-400 text-emerald-600 dark:text-emerald-400 dark:border-emerald-900/30';
      case 'deadline':
        return 'border-amber-400 text-amber-600 dark:text-amber-400 dark:border-amber-900/30';
      default:
        return 'border-blue-400 text-blue-600 dark:text-blue-400 dark:border-blue-900/30';
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 rounded-sm border border-gray-200 dark:border-gray-700 shadow-md overflow-hidden my-3">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 flex items-center justify-between text-white">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span className="font-semibold text-sm">Upcoming Campus Events</span>
        </div>
      </div>
      <div className="p-3 space-y-3 max-h-[300px] overflow-y-auto">
        {events.map((event, idx) => (
          <div key={idx} className="flex gap-3 relative last:pb-0 pb-3 border-b last:border-0 border-gray-50 dark:border-gray-700/50">
            <div className="w-12 text-center shrink-0">
              <span className="block text-xs font-bold text-gray-700 dark:text-gray-300">
                {formatDate(event.date)}
              </span>
              <span className="block text-[10px] text-gray-400 uppercase">
                {formatDate(event.date)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-semibold text-xs text-gray-800 dark:text-gray-200 leading-tight">{event.title}</h4>
                <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded shrink-0 uppercase border ${getEventTypeStyle(event.eventType)}`}>
                  {event.eventType}
                </span>
              </div>
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
                {event.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
