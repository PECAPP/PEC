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
        className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer border-l-4 border-l-success"
        onClick={() => onStatClick('attendance')}
      >
        <div className="flex items-center gap-4 z-10 relative">
          <div className="p-3 rounded-lg border border-success/20 flex items-center justify-center rounded-lg border border-success/20 flex items-center justify-center rounded-lg border border-success/20 flex items-center justify-center bg-success/10 text-success">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium  text-muted-foreground">Upcoming Deadlines</p>
            <p className="text-2xl font-bold text-foreground">3</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>

      <motion.div 
        variants={item} 
        className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer border-l-4 border-l-primary"
        onClick={() => onStatClick('courses')}
      >
        <div className="flex items-center gap-4 z-10 relative">
          <div className="p-3 rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center rounded-lg border border-border/40 flex items-center justify-center bg-primary/10 text-primary">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium  text-muted-foreground">Enrolled</p>
            <p className="text-2xl font-bold text-foreground">{stats.enrolledCourses}</p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>

      <motion.div 
        variants={item} 
        className="rounded-xl border border-border/50 bg-card p-4 md:p-6 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 relative overflow-hidden group cursor-pointer border-l-4 border-l-amber-500"
        onClick={() => onStatClick('scores')}
      >
        <div className="flex items-center gap-4 z-10 relative">
          <div className="p-3 rounded-lg border border-amber-500/20 flex items-center justify-center rounded-lg border border-amber-500/20 flex items-center justify-center rounded-lg border border-amber-500/20 flex items-center justify-center bg-amber-500/10 text-amber-500">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-medium  text-muted-foreground">Current SGPA</p>
            <p className="text-2xl font-bold text-foreground">8.5 <span className="text-[10px] font-normal text-muted-foreground hover:underline hover:text-amber-500 transition-colors cursor-pointer ml-1">View Full Sheet</span></p>
          </div>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      </motion.div>
    </motion.div>
  );
}
