'use client';

import { useState, useMemo } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventDetailModal } from './EventDetailModal';
import { getEventDotColor, getEventLabel, EVENT_LABELS, CATEGORY_LABELS } from './calendar-utils';

interface AcademicCalendarEvent {
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

interface InteractiveCalendarProps {
  events: AcademicCalendarEvent[];
  isAdmin?: boolean;
  onEventEdit?: (event: AcademicCalendarEvent) => void;
  onEventDelete?: (id: string) => void;
  onEventsChange?: () => void;
}

export function InteractiveCalendar({
  events,
  isAdmin = false,
  onEventEdit,
  onEventDelete,
  onEventsChange,
}: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [month, setMonth] = useState<Date>(new Date());

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      return matchesType && matchesCategory;
    });
  }, [events, eventTypeFilter, categoryFilter]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, AcademicCalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!map[dateKey]) {
        map[dateKey] = [];
      }
      map[dateKey].push(event);
    });
    return map;
  }, [filteredEvents]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  const handleDayClick = (day: Date, modifiers: any) => {
    setSelectedDate(day);
    const dateKey = format(day, 'yyyy-MM-dd');
    const dayEvents = eventsByDate[dateKey];

    if (dayEvents && dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setIsDetailOpen(true);
    }
  };

  const handleEventClick = (event: AcademicCalendarEvent) => {
    setSelectedEvent(event);
    setIsDetailOpen(true);
  };

  const uniqueEventTypes = useMemo(() => {
    const types = new Set(events.map((e) => e.eventType));
    return Array.from(types);
  }, [events]);

  const uniqueCategories = useMemo(() => {
    const cats = new Set(events.map((e) => e.category));
    return Array.from(cats);
  }, [events]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Academic Calendar</h2>
          <p className="text-muted-foreground">
            {filteredEvents.length} events scheduled
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Event Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {uniqueEventTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {EVENT_LABELS[type] || type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {uniqueCategories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {CATEGORY_LABELS[cat] || cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card border rounded-lg p-4">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              month={month}
              onMonthChange={setMonth}
              onDayClick={handleDayClick}
              modifiers={{
                hasEvent: (date) => {
                  const dateKey = format(date, 'yyyy-MM-dd');
                  return !!eventsByDate[dateKey];
                },
              }}
              modifiersClassNames={{
                hasEvent: 'font-bold',
              }}
              classNames={{
                day: 'relative h-10 w-full flex flex-col items-center justify-center rounded-md text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer',
                selected: 'bg-primary text-primary-foreground',
                outside: 'text-muted-foreground',
                hidden: 'hidden',
              }}
              className="!w-full"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">
              {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
            </h3>

            {selectedDateEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No events on this date</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <button
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{event.title}</p>
                        {event.startTime && (
                          <p className="text-xs text-muted-foreground">
                            {event.startTime} - {event.endTime || 'TBD'}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {getEventLabel(event.eventType)}
                      </Badge>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-card border rounded-lg p-4">
            <h3 className="font-semibold mb-3">Legend</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(EVENT_LABELS).map(([type, label]) => (
                <div key={type} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getEventDotColor(type)}`} />
                  <span className="text-xs">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <EventDetailModal
        event={selectedEvent}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedEvent(null);
        }}
        isAdmin={isAdmin}
        onEdit={onEventEdit}
        onDelete={(id) => {
          onEventDelete?.(id);
          onEventsChange?.();
        }}
      />
    </div>
  );
}
