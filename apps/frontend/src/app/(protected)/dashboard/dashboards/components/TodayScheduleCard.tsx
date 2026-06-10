'use client';
import { useEffect, useState } from 'react';

import { Calendar, ArrowUpRight, User, MapPin } from 'lucide-react';
import { Button, Badge } from '@pec/ui';
import { EmptyState } from '@/components/common/AsyncState';
import Link from 'next/link';

interface ScheduleCardItem {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface Props {
  scheduleDay: string;
  todayClasses: ScheduleCardItem[];
  todayEvents?: any[];
  onViewFull: () => void;
  containerHeight?: number | null;
}

export function TodayScheduleCard({ scheduleDay, todayClasses, todayEvents = [], onViewFull, containerHeight }: Props) {
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    const now = new Date();
    setCurrentTimeStr(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
  }, []);

  return (
    <div
      className="card-elevated ui-card-pad flex h-fit flex-col"
      style={containerHeight ? { height: containerHeight } : undefined}
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-foreground">
          <Calendar className="h-5 w-5 text-primary" />
          {scheduleDay}&apos;s Schedule
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewFull}>
          Full
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </Button>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {todayEvents.length > 0 && (
          <div className="mb-3 rounded-sm border border-primary/20 bg-primary/5 p-3">
            <div className="flex items-center gap-2 mb-1">
              <Badge className="bg-primary hover:bg-primary text-primary-foreground text-[10px] px-1.5 h-4">
                {todayEvents[0].eventType === 'holiday' ? 'HOLIDAY' : todayEvents[0].eventType === 'exam' ? 'EXAM' : 'EVENT'}
              </Badge>
              <span className="text-sm font-bold text-foreground">{todayEvents[0].title}</span>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{todayEvents[0].description}</p>
          </div>
        )}

        {todayClasses.length === 0 ? (
          <EmptyState 
            title={todayEvents.length > 0 ? "No classes scheduled" : "No classes scheduled"} 
            description={todayEvents.length > 0 ? "Enjoy your day!" : "You are all clear for this day."} 
          />
        ) : (
          todayClasses.map((cls, index) => {
            const isOngoing = currentTimeStr && currentTimeStr >= cls.startTime && currentTimeStr <= cls.endTime;
            
            return (
              <div 
                key={`${cls.id || 'class'}-${index}`} 
                className={`rounded-sm border p-3 transition-all duration-300 ${isOngoing ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10 ring-1 ring-primary/20' : 'border-border bg-secondary/10'}`}
              >
                <div className="mb-2 flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground whitespace-nowrap shrink-0">{cls.courseCode}</span>
                      <span className="truncate border-l border-border pl-2 text-xs text-muted-foreground">
                        {cls.courseName}
                      </span>
                      {isOngoing && (
                        <Badge variant="default" className="h-4 px-1.5 text-[8px] animate-pulse bg-primary text-primary-foreground border-none">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <User className="h-3 w-3 opacity-70" /> 
                      <span className="truncate">{cls.instructor}</span>
                    </p>
                  </div>
                  <Badge variant="outline" className={`shrink-0 whitespace-nowrap text-[10px] ${isOngoing ? 'bg-primary/20 border-primary/30 text-primary font-bold' : 'bg-background'}`}>
                    {cls.startTime} - {cls.endTime}
                  </Badge>
                </div>
                <Link href={`/rooms`} className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors cursor-pointer group/room">
                  <MapPin className="h-3 w-3 group-hover/room:scale-110 transition-transform" />
                  {cls.room}
                </Link>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

