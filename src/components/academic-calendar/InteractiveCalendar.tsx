'use client';

import { useState, useMemo, useEffect } from 'react';
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
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EventDetailModal } from './EventDetailModal';
import { getEventDotColor, getEventLabel, EVENT_LABELS, CATEGORY_LABELS } from './calendar-utils';
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
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function InteractiveCalendar({
  events,
  isAdmin = false,
  onEventEdit,
  onEventDelete,
  onEventsChange,
}: InteractiveCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfToday());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<AcademicCalendarEvent | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 rounded-3xl border border-primary/10 backdrop-blur-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <CalendarIcon className="w-64 h-64 -mr-12 -mt-12" />
        </div>
        <div className="relative z-10 flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight mb-2">Academic Calendar</h1>
            <p className="text-muted-foreground text-lg">
              Stay organized with all your academic events, deadlines, and holidays.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button variant="default" onClick={handleToday} className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
              Today
            </Button>
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="Search events..."
                className="pl-10 w-[240px] rounded-xl border-primary/20 focus-visible:ring-primary shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Calendar Area */}
        <div className="xl:col-span-8 space-y-6">
          <div className="bg-card/50 border border-border/40 rounded-3xl p-6 md:p-8 backdrop-blur-md shadow-xl">
            {/* Calendar Controls */}
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <h3 className="text-3xl font-bold">{format(currentMonth, 'MMMM')}</h3>
                <span className="text-3xl font-light text-muted-foreground">{format(currentMonth, 'yyyy')}</span>
              </div>
              <div className="flex gap-3 bg-muted/40 p-1.5 rounded-2xl border border-border/50">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-xl hover:bg-background transition-colors">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="w-[1px] h-5 bg-border/50 self-center mx-1" />
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-xl hover:bg-background transition-colors">
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-4 mb-6">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-xs font-bold uppercase tracking-widest text-muted-foreground/60 py-2">
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
                    return <div key={`empty-${idx}`} className="h-20 md:h-28" />;
                  }

                  const dateKey = format(day, 'yyyy-MM-dd');
                  const dayEvents = eventsByDate[dateKey] || [];
                  const isToday = isDateToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentMonth);

                  return (
                    <motion.button
                      key={dateKey}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedDate(day)}
                      className={cn(
                        "min-h-24 md:min-h-32 p-2.5 rounded-2xl border transition-all relative flex flex-col items-start gap-2 text-left overflow-hidden",
                        !isCurrentMonth ? "text-muted-foreground/30 opacity-40 border-transparent bg-transparent" : "bg-background shadow-sm hover:shadow-md",
                        isSelected ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20 z-10 scale-[1.03]" : "hover:border-primary/40",
                        isToday && !isSelected ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20" : "border-border/60"
                      )}
                    >
                      <div className="flex justify-between w-full items-start px-1">
                        <span className={cn(
                          "text-base font-bold transition-colors",
                          isSelected ? "text-primary-foreground" : "text-foreground",
                          isToday && !isSelected ? "text-primary" : ""
                        )}>
                          {format(day, 'd')}
                        </span>
                        {isToday && (
                          <div className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            isSelected ? "bg-primary-foreground" : "bg-primary"
                          )} />
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-1.5 w-full">
                        {dayEvents.slice(0, 2).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-[10px] md:text-xs px-2 py-1 rounded-lg truncate font-semibold transition-all leading-tight",
                              isSelected 
                                ? "bg-primary-foreground/20 text-primary-foreground" 
                                : "bg-primary/15 text-primary border border-primary/20"
                            )}
                            title={event.title}
                          >
                            <span className="truncate block">{event.title}</span>
                            {event.startTime && (
                              <span className="text-[9px] opacity-75 block truncate">{event.startTime}</span>
                            )}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={cn(
                            "text-[9px] px-2 py-0.5 font-bold",
                            isSelected ? "text-primary-foreground/80" : "text-muted-foreground/80"
                          )}>
                            +{dayEvents.length - 2} more
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
          <div className="bg-card/30 border border-border/40 rounded-3xl p-6 backdrop-blur-sm flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <span className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">Filters</span>
            </div>
            
            <div className="h-8 w-[1px] bg-border/50 hidden md:block" />

            <div className="flex items-center gap-4 flex-1">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="all">All Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type}>{EVENT_LABELS[type] || type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px] rounded-xl border-border/60 bg-background/50 hover:bg-background transition-all">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
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
          <div className="bg-card border border-border/40 rounded-3xl overflow-hidden shadow-xl sticky top-8">
            {/* Sidebar Header */}
            <div className="bg-primary/5 p-6 border-b border-border/40 flex items-center justify-between">
              <div className="space-y-1">
                <h3 className="font-bold text-lg">Daily Agenda</h3>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-tighter">
                  {selectedDate ? format(selectedDate, 'EEEE, MMMM d') : 'Select a date'}
                </p>
              </div>
              <CalendarIcon className="w-6 h-6 text-primary/60" />
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
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground/60">
                      <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mb-4">
                        <CalendarIcon className="w-8 h-8" />
                      </div>
                      <p className="font-medium">No events scheduled</p>
                      <p className="text-sm">Check another date or adjust filters</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDateEvents.map((event) => (
                        <motion.button
                          key={event.id}
                          whileHover={{ x: 4 }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDetailOpen(true);
                          }}
                          className="w-full text-left p-4 rounded-2xl border border-border/60 bg-background hover:bg-accent transition-all group flex gap-4"
                        >
                          <div className={cn(
                            "w-1 rounded-full shrink-0 group-hover:scale-y-110 transition-transform duration-300",
                            getEventDotColor(event.eventType)
                          )} />
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-bold text-sm truncate leading-none pt-0.5 group-hover:text-primary transition-colors">
                                {event.title}
                              </h4>
                              <Badge variant="outline" className="text-[10px] h-5 rounded-full px-2 py-0 font-medium shrink-0">
                                {getEventLabel(event.eventType)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                                <Clock className="w-3 h-3" />
                                {event.startTime || 'TBD'}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium truncate">
                                  <MapPin className="w-3 h-3" />
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
            <div className="p-6 bg-muted/20 border-t border-border/40">
              <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 flex items-center gap-2">
                <span className="w-1 h-3 bg-primary rounded-full" />
                Color Legend
              </h4>
              <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                {Object.entries(EVENT_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center gap-2 hover:translate-x-1 transition-transform cursor-default">
                    <div className={cn("w-2 h-2 rounded-full", getEventDotColor(type))} />
                    <span className="text-[10px] font-bold text-muted-foreground/90 uppercase tracking-tighter">{label}</span>
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
