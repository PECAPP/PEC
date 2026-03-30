'use client';

import { motion } from 'framer-motion';
import { Clock, CheckCircle, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onViewFull: () => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FacultyTodaySchedule({ onViewFull }: Props) {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Today's Schedule</h2>
        <Button variant="ghost" size="sm" onClick={onViewFull}>
          Full Timetable
          <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
      <div className="space-y-3">
        <ScheduleItem
          time="09:00 - 10:30"
          course="Data Structures & Algorithms"
          section="CSE-A"
          room="Room 204"
          students={62}
          status="completed"
        />
        <ScheduleItem
          time="11:00 - 12:30"
          course="Database Management Systems"
          section="CSE-B"
          room="Lab 3"
          students={58}
          status="ongoing"
        />
        <ScheduleItem
          time="14:00 - 15:30"
          course="Data Structures & Algorithms"
          section="CSE-C"
          room="Room 301"
          students={65}
          status="upcoming"
        />
        <ScheduleItem
          time="16:00 - 17:00"
          course="DBMS Lab"
          section="CSE-A"
          room="Lab 2"
          students={30}
          status="upcoming"
        />
      </div>
    </motion.div>
  );
}

function ScheduleItem({ time, course, section, room, students, status }: any) {
  const statusStyles: any = {
    completed: 'bg-muted text-muted-foreground',
    ongoing: 'bg-accent/10 border-accent/30 text-foreground',
    upcoming: 'bg-card text-foreground',
  };

  return (
    <div className={`p-3 rounded-lg border ${statusStyles[status]} flex items-center gap-4`}>
      <div className="flex items-center gap-2 w-28 shrink-0">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{course}</p>
        <p className="text-sm text-muted-foreground">{section} · {room} · {students} students</p>
      </div>
      {status === 'completed' && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
      {status === 'ongoing' && <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">Live</span>}
    </div>
  );
}
