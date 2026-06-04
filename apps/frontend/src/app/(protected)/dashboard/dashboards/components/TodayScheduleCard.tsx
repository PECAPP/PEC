'use client';

import { Calendar, ArrowUpRight, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/AsyncState';

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
  onViewFull: () => void;
  containerHeight?: number | null;
}

export function TodayScheduleCard({ scheduleDay, todayClasses, onViewFull, containerHeight }: Props) {
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
        {todayClasses.length === 0 ? (
          <EmptyState title="No classes scheduled" description="You are all clear for this day." />
        ) : (
          todayClasses.map((cls, index) => {
            const now = new Date();
            const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            const isOngoing = currentTimeStr >= cls.startTime && currentTimeStr <= cls.endTime;
            
            return (
              <div 
                key={`${cls.id || 'class'}-${index}`} 
                className={`rounded-lg border p-3 transition-all duration-300 ${isOngoing ? 'border-primary bg-primary/5 shadow-md shadow-primary/10 ring-1 ring-primary/20' : 'border-border bg-secondary/10'}`}
              >
                <div className="mb-2 flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-foreground">{cls.courseCode}</span>
                      <span className="line-clamp-1 border-l border-border pl-2 text-xs text-muted-foreground">
                        {cls.courseName}
                      </span>
                      {isOngoing && (
                        <Badge variant="default" className="h-4 px-1.5 text-[8px] animate-pulse bg-primary text-primary-foreground border-none">
                          LIVE
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <User className="h-3 w-3" /> {cls.instructor}
                    </p>
                  </div>
                  <Badge variant="outline" className={`whitespace-nowrap text-[10px] ${isOngoing ? 'bg-primary/20 border-primary/30 text-primary font-bold' : 'bg-background'}`}>
                    {cls.startTime} - {cls.endTime}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {cls.room}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
