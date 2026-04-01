'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, BookOpen, GraduationCap } from 'lucide-react';

interface StatsProps {
  stats: {
    attendancePercentage: number;
    enrolledCourses: number;
  };
  onStatClick: (type: 'attendance' | 'courses' | 'scores') => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { opacity: 1, scale: 1 }
};

export function StudentStatsCards({ stats, onStatClick }: StatsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-3"
    >

      <motion.div 
        variants={item} 
        className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-all border-l-4 border-l-success"
        onClick={() => onStatClick('attendance')}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-success/10 text-success">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attendance</p>
            <p className="text-2xl font-black text-foreground">{stats.attendancePercentage}%</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={item} 
        className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-all border-l-4 border-l-primary"
        onClick={() => onStatClick('courses')}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-primary/10 text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Enrolled</p>
            <p className="text-2xl font-black text-foreground">{stats.enrolledCourses}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={item} 
        className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-all border-l-4 border-l-amber-500"
        onClick={() => onStatClick('scores')}
      >
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Score Sheet</p>
            <p className="text-2xl font-black text-foreground text-amber-500">VIEW</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
