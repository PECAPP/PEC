'use client';
import { Button, Badge, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@pec/ui";


import { useState, useMemo } from 'react';
import { 
  format, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  getDay, 
  addMonths, 
  subMonths,
  isToday as isDateToday,
  startOfToday
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Search, 
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { EventDetailModal } from './EventDetailModal';
import { getEventDotColor, getEventLabel, getEventColor, EVENT_LABELS, CATEGORY_LABELS } from './calendar-utils';
import { cn } from '@/lib/utils';

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
  onCreateEventAtDate?: (date: string) => void;
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function InteractiveCalendar({
  events,
  isAdmin = false,
  onEventEdit,
  onEventDelete,
  onEventsChange,
  onCreateEventAtDate,
}: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [_isSidebarCollapsed, _setIsSidebarCollapsed] = useState(false);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesType = eventTypeFilter === 'all' || event.eventType === eventTypeFilter;
      const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
      const matchesSearch = searchQuery === '' || 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        event.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesType && matchesCategory && matchesSearch;
    });
  }, [events, eventTypeFilter, categoryFilter, searchQuery]);

  const eventsByDate = useMemo(() => {
    const map: Record<string, AcademicCalendarEvent[]> = {};
    filteredEvents.forEach((event) => {
      const dateKey = format(new Date(event.date), 'yyyy-MM-dd');
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(event);
    });
    return map;
  }, [filteredEvents]);

  const calendarDays = useMemo(() => {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start, end });
    
    const startPadding = getDay(start);
    const paddedDays: (Date | null)[] = Array(startPadding).fill(null);
    
    return [...paddedDays, ...days];
  }, [currentMonth]);

  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return eventsByDate[dateKey] || [];
  }, [selectedDate, eventsByDate]);

  const uniqueEventTypes = useMemo(() => Array.from(new Set(events.map((e) => e.eventType))), [events]);
  const uniqueCategories = useMemo(() => Array.from(new Set(events.map((e) => e.category))), [events]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const handleToday = () => {
    const today = startOfToday();
    setSelectedDate(today);
    setCurrentMonth(today);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Compact Controls Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleToday} className="font-semibold text-xs gap-1.5">
            <CalendarIcon className="w-3.5 h-3.5" />
            Today
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Search events..."
            className="pl-9 w-[240px] h-9 text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Calendar Area */}
        <div className="xl:col-span-8 space-y-4">
          <div className="bg-card border border-border rounded-sm p-6 shadow-sm relative overflow-hidden">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 border-b border-border pb-5">
              <div className="flex items-baseline gap-3">
                <h3 className="text-2xl font-bold tracking-tight text-foreground">
                  {format(currentMonth, 'MMMM')}
                </h3>
                <span className="text-2xl font-medium text-muted-foreground/60 tracking-tight">
                  {format(currentMonth, 'yyyy')}
                </span>
              </div>
              <div className="flex gap-1 bg-muted/30 p-1 rounded-sm border border-border self-stretch sm:self-auto overflow-hidden">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-sm h-10 w-10 hover:bg-background transition-all">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-sm h-10 w-10 hover:bg-background transition-all">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-0 border-b border-border/20 mb-4">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-3 border-r last:border-r-0 border-border/10">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid Body */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentMonth.toISOString()}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="grid grid-cols-7 gap-2 md:gap-4"
              >
                {calendarDays.map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="h-24 md:h-32 border border-transparent" />;
                  }

                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isToday = isDateToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <motion.button
                      key={dateKey}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-[100px] md:min-h-[140px] p-4 rounded-sm border transition-all relative flex flex-col items-start gap-4 text-left overflow-hidden group hover:bg-muted/40",
                        !isCurrentMonth ? "opacity-10 pointer-events-none" : "bg-card hover:border-border/40",
                        isSelected ? "bg-primary text-primary-foreground border-border/40 z-10" : "border-border/60",
                        isToday && !isSelected ? "border-primary/40 bg-primary/5" : ""
                      )}
                    >
                      <div className="flex justify-between w-full items-start">
                        <span className={cn(
                          "text-lg font-semibold tracking-tight transition-all",
                          isSelected ? "text-primary-foreground" : "text-foreground",
                          isToday && !isSelected ? "text-primary" : ""
                        )}>
                          {format(day, 'd')}
                        </span>
                        {isToday && (
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full mt-2",
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          )} />
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1 w-full mt-auto">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-[10px] px-2 py-0.5 rounded-sm border-l-2 font-medium transition-all truncate",
                              isSelected 
                                ? "bg-primary-foreground/10 text-primary-foreground border-white/40" 
                                : getEventColor(event.eventType)
                            )}
                            title={event.title}
                          >
                            <span>{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={cn(
                            "text-[10px] px-2 py-0.5 font-medium opacity-80",
                            isSelected ? "text-primary-foreground" : "text-muted-foreground"
                          )}>
                            + {dayEvents.length - 2} More
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Filtering Controls */}
          <div className="bg-card border border-border rounded-sm p-6 flex flex-wrap items-center gap-6 shadow-sm">
            <div className="flex items-center gap-2 text-primary">
              <Filter className="w-4 h-4" />
              <h4 className="font-semibold text-sm">Filters</h4>
            </div>
            
            <div className="h-8 w-[1px] bg-border hidden md:block" />
 
            <div className="flex items-center gap-3 flex-1">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[180px] rounded-sm h-10 text-sm">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{EVENT_LABELS[type] || type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
 
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] rounded-sm h-10 text-sm">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all">All Categories</SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{CATEGORY_LABELS[cat] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sidebar Area - Daily Agenda */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm sticky top-8">
            {/* Sidebar Header */}
            <div className="bg-muted/30 p-6 border-b border-border flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-lg tracking-tight">Daily Brief</h3>
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
                </div>
              </div>
              {isAdmin && onCreateEventAtDate && (
                <Button
                  size="sm"
                  onClick={() => selectedDate && onCreateEventAtDate(format(selectedDate, 'yyyy-MM-dd'))}
                  disabled={!selectedDate}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add Event
                </Button>
              )}
            </div>

            <div className="p-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedDate?.toISOString()}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-4"
                >
                  {selectedDateEvents.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">No Events</h4>
                      <p className="text-xs text-muted-foreground/70 max-w-[180px]">
                        There are no events scheduled for this day.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 relative before:absolute before:left-[17px] before:top-4 before:bottom-4 before:w-[1px] before:bg-border/40">
                      {selectedDateEvents.map((event) => (
                        <motion.button
                          key={event.id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDetailOpen(true);
                          }}
                          className="w-full text-left pl-10 relative group"
                        >
                          <div className={cn(
                            "absolute left-[11px] top-4 w-3 h-3 rounded-full border bg-background z-10",
                            getEventDotColor(event.eventType).replace('bg-', 'border-').split(' ')[0]
                          )} />

                          <div className="bg-card hover:bg-muted/30 border border-border/60 hover:border-border p-4 rounded-sm transition-all duration-200">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <h4 className="font-semibold text-sm leading-snug">
                                {event.title}
                              </h4>
                              <Badge variant="outline" className={cn(
                                "text-[10px] px-1.5 py-0 rounded-sm shrink-0 border-border",
                                getEventColor(event.eventType)
                              )}>
                                {getEventLabel(event.eventType)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                                <Clock className="w-3 h-3 text-muted-foreground/70" />
                                {event.startTime || 'All Day'}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium truncate max-w-[150px]">
                                  <MapPin className="w-3 h-3 text-muted-foreground/70" />
                                  <span className="truncate">{event.location}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Legend Section */}
            <div className="p-6 bg-muted/20 border-t">
              <h4 className="text-xs font-semibold text-muted-foreground mb-4">
                Legend
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(EVENT_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2">
                    <div className={cn("w-2 h-2 rounded-full", getEventDotColor(type))} />
                    <span className="text-xs text-muted-foreground">{label}</span>
                  </div>
                ))}
              </div>
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
