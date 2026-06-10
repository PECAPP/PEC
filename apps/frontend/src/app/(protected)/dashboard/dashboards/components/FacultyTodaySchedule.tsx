'use client';
import { Button } from "@pec/ui";


import { motion } from 'framer-motion';
import { Clock, CheckCircle, ArrowUpRight, QrCode } from 'lucide-react';

interface Props {
  schedule?: {
    id: string;
    courseId: string;
    time: string;
    course: string;
    section: string;
    room: string;
    students: number;
    status: 'completed' | 'ongoing' | 'upcoming';
  }[];
  onViewFull: () => void;
  onGenerateQR?: (courseId: string) => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FacultyTodaySchedule({ schedule, onViewFull, onGenerateQR }: Props) {
  const safeSchedule = Array.isArray(schedule) ? schedule : [];
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Today&apos;s Schedule</h2>
        <Button variant="ghost" size="sm" onClick={onViewFull}>
          Full Timetable
          <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
      <div className="space-y-3">
        {safeSchedule.length === 0 ? (
          <p className="text-sm text-muted-foreground">No classes scheduled for today.</p>
        ) : (
          safeSchedule.map((slot) => (
            <ScheduleItem
              key={slot.id}
              time={slot.time}
              course={slot.course}
              section={slot.section}
              room={slot.room}
              students={slot.students}
              courseId={slot.courseId}
              status={slot.status}
              onGenerateQR={onGenerateQR}
            />
          ))
        )}
      </div>
    </motion.div>
  );
}

function ScheduleItem({ courseId,  time, course, section, room, students, status , onGenerateQR }: any) {
  const statusStyles: any = {
    completed: 'bg-muted text-muted-foreground',
    ongoing: 'bg-accent/10 border-accent/30 text-foreground',
    upcoming: 'bg-card text-foreground',
  };

  return (
    <div className={`p-3 rounded-sm border ${statusStyles[status]} flex items-center gap-4`}>
      <div className="flex items-center gap-2 w-28 shrink-0">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{course}</p>
        <p className="text-sm text-muted-foreground">{section} - {room} - {students} students</p>
      </div>
      {status === 'completed' && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
      {status === 'ongoing' && (
        <div className="flex items-center gap-2 shrink-0">
          <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full hidden sm:inline-flex">Live</span>
          <Button size="sm" onClick={() => onGenerateQR?.(courseId)} className="h-7 text-xs shadow-sm shadow-primary/20">
            <QrCode className="w-3 h-3 mr-1" /> QR Attend
          </Button>
        </div>
      )}
    </div>
  );
}


