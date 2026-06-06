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
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
      <div className="bg-background border-b border-border p-12 rounded-sm relative overflow-hidden bg-grid-pattern">
        <div className="relative z-10 flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="space-y-4">
            <h1 className="text-6xl font-bold tracking-tight uppercase leading-none font-display">
              Academic <span className="text-primary/20 block md:inline">Calendar</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-xl font-medium font-sans uppercase tracking-[0.1em]">
              Institutional Milestones • PEC Campus Events • Examination Schedules
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Button variant="default" onClick={handleToday} className="rounded-sm px-8 h-12 font-bold uppercase tracking-widest transition-all">
              Jump to Today
            </Button>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <Input
                placeholder="PROBE EVENTS..."
                className="pl-12 w-[280px] h-12 rounded-sm border-border bg-background/50 focus-visible:ring-0 focus-visible:border-primary uppercase text-[10px] font-black tracking-widest"
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
        <div className="xl:col-span-8 space-y-8">
          <div className="bg-card border border-border rounded-sm p-10 shadow-sm relative overflow-hidden">
            {/* Calendar Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12 border-b border-border pb-8">
              <div className="flex items-baseline gap-4">
                <h3 className="text-5xl font-bold tracking-tight text-foreground font-display uppercase">
                  {format(currentMonth, 'MMMM')}
                </h3>
                <span className="text-5xl font-light text-muted-foreground/30 tracking-tight font-display">
                  {format(currentMonth, 'yyyy')}
                </span>
              </div>
              <div className="flex gap-0 bg-muted/20 p-0 rounded-sm border border-border self-stretch sm:self-auto overflow-hidden">
                <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="rounded-none h-12 w-12 hover:bg-background transition-all border-r border-border">
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleNextMonth} className="rounded-none h-12 w-12 hover:bg-background transition-all">
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
            </div>

            {/* Calendar Grid Header */}
            <div className="grid grid-cols-7 gap-0 border-b border-border/20 mb-4">
              {WEEKDAYS.map((day) => (
                <div key={day} className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 py-4 border-r last:border-r-0 border-border/10">
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
                        !isCurrentMonth ? "opacity-10 pointer-events-none" : "bg-card hover:border-primary",
                        isSelected ? "bg-primary text-primary-foreground border-primary z-10" : "border-border/60",
                        isToday && !isSelected ? "border-primary/40 bg-primary/5" : ""
                      )}
                    >
                      <div className="flex justify-between w-full items-start">
                        <span className={cn(
                          "text-2xl font-bold tracking-tight transition-all font-display",
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
                      
                      <div className="flex flex-col gap-1.5 w-full mt-auto">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div
                            key={event.id}
                            className={cn(
                              "text-[9px] px-2 py-1 border-l-2 font-bold transition-all leading-tight uppercase tracking-wider",
                              isSelected 
                                ? "bg-primary-foreground/10 text-primary-foreground border-white/40" 
                                : getEventColor(event.eventType)
                            )}
                            title={event.title}
                          >
                            <span className="truncate block">{event.title}</span>
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={cn(
                            "text-[9px] px-2 py-0.5 font-black uppercase tracking-widest opacity-60",
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
          <div className="bg-card border border-border rounded-sm p-8 flex flex-wrap items-center gap-8 shadow-sm">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h4 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground font-display">Refine Scope</h4>
            </div>
            
            <div className="h-10 w-[1px] bg-border hidden md:block" />
 
            <div className="flex items-center gap-4 flex-1">
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-[200px] rounded-sm border-border bg-background focus:ring-0 uppercase text-[10px] font-black tracking-widest h-12">
                  <SelectValue placeholder="Event Type" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  <SelectItem value="all" className="uppercase text-[10px] font-bold">All Types</SelectItem>
                  {uniqueEventTypes.map((type) => (
                    <SelectItem key={type} value={type} className="uppercase text-[10px] font-bold">{EVENT_LABELS[type] || type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
 
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[200px] rounded-sm border-border bg-background focus:ring-0 uppercase text-[10px] font-black tracking-widest h-12">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-border bg-card">
                  <SelectItem value="all" className="uppercase text-[10px] font-bold">All Categories</SelectItem>
                  {uniqueCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="uppercase text-[10px] font-bold">{CATEGORY_LABELS[cat] || cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Sidebar Area - Daily Agenda */}
        <div className="xl:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm sticky top-8">
            {/* Sidebar Header */}
            <div className="bg-muted/10 p-10 border-b border-border flex items-center justify-between bg-grid-pattern">
              <div className="space-y-2">
                <h3 className="font-bold text-2xl tracking-tight uppercase font-display">Daily Brief</h3>
                <div className="flex items-center gap-2 text-[10px] text-primary font-black uppercase tracking-[0.2em]">
                  {selectedDate ? format(selectedDate, 'EEEE · MMM d') : 'Select a date'}
                </div>
              </div>
              {isAdmin && onCreateEventAtDate && (
                <Button
                  size="sm"
                  onClick={() => selectedDate && onCreateEventAtDate(format(selectedDate, 'yyyy-MM-dd'))}
                  disabled={!selectedDate}
                  className="rounded-none h-10 px-4 font-black uppercase tracking-widest"
                >
                  <Plus className="w-4 h-4 mr-2" />
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
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <h4 className="font-bold text-xs uppercase tracking-[0.3em] text-muted-foreground/40 mb-4 font-display">Structural Void</h4>
                      <p className="text-[10px] text-muted-foreground/30 max-w-[180px] font-bold uppercase tracking-widest leading-loose">
                        No events mapped for this coordinates.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6 relative before:absolute before:left-[17px] before:top-2 before:bottom-2 before:w-[1px] before:bg-border/20">
                      {selectedDateEvents.map((event) => (
                        <motion.button
                          key={event.id}
                          whileHover={{ x: 6 }}
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDetailOpen(true);
                          }}
                          className="w-full text-left pl-10 relative group"
                        >
                          <div className={cn(
                            "absolute left-0 top-1.5 w-[35px] h-[35px] rounded-xl flex items-center justify-center border bg-background group-hover:scale-110 transition-all duration-300 z-10 shadow-lg",
                            getEventDotColor(event.eventType).replace('bg-', 'border-').split(' ')[0], // Border color from dot color
                          )}>
                            <div className={cn("w-2 h-2 rounded-full", getEventDotColor(event.eventType))} />
                          </div>

                          <div className="bg-muted/5 group-hover:bg-muted/10 border border-border/60 group-hover:border-primary p-6 rounded-sm transition-all duration-300">
                            <div className="flex items-start justify-between gap-4 mb-4">
                              <h4 className="font-bold text-sm tracking-tight text-foreground uppercase font-display leading-tight">
                                {event.title}
                              </h4>
                              <Badge variant="outline" className={cn(
                                "text-[8px] h-5 rounded-none px-2 font-black uppercase tracking-widest shrink-0 border-border",
                                getEventColor(event.eventType)
                              )}>
                                {getEventLabel(event.eventType)}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                              <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                <Clock className="w-3 h-3 text-primary" />
                                {event.startTime || 'All Day'}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-bold uppercase tracking-widest truncate max-w-[150px]">
                                  <MapPin className="w-3 h-3 text-primary" />
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
            <div className="p-8 bg-muted/10 border-t border-border/10">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mb-6 flex items-center gap-3">
                <div className="w-4 h-[1px] bg-primary/40" />
                Index
              </h4>
              <div className="grid grid-cols-1 gap-3">
                {Object.entries(EVENT_LABELS).map(([type, label]) => (
                  <div key={type} className="flex items-center justify-between group cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-sm rotate-45", getEventDotColor(type))} />
                      <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">{label}</span>
                    </div>
                    <div className="w-8 h-[1px] bg-border/10" />
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
