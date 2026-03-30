'use client';

import { Calendar, ArrowUpRight, User, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/AsyncState';

interface Props {
  scheduleDay: string;
  todayClasses: any[];
  onViewFull: () => void;
}

export function TodayScheduleCard({ scheduleDay, todayClasses, onViewFull }: Props) {
  return (
    <div className="card-elevated ui-card-pad">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          {scheduleDay}'s Schedule
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewFull}>
          Full
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="space-y-3">
        {todayClasses.length === 0 ? (
          <EmptyState
            title="No classes scheduled"
            description="You’re all clear for this day."
          />
        ) : (
          todayClasses.map((cls, idx) => (
            <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/10">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-foreground">{cls.courseCode}</span>
                    <span className="text-xs text-muted-foreground line-clamp-1 border-l border-border pl-2">{cls.courseName}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                    <User className="w-3 h-3" /> {cls.instructor}
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] bg-background whitespace-nowrap">{cls.startTime} - {cls.endTime}</Badge>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                <MapPin className="w-3 h-3" />
                {cls.room}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
