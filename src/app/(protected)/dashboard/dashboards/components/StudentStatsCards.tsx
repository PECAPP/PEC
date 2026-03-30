'use client';

import { motion } from 'framer-motion';
import { TrendingUp, ClipboardCheck, BookOpen } from 'lucide-react';

interface StatsProps {
  stats: {
    attendancePercentage: number;
    enrolledCourses: number;
  };
  onStatClick: (type: 'attendance' | 'courses') => void;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

export function StudentStatsCards({ stats, onStatClick }: StatsProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid gap-4 md:grid-cols-2"
    >

      <motion.div 
        variants={item} 
        className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
        onClick={() => onStatClick('attendance')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-success/10">
            <ClipboardCheck className="w-5 h-5 text-success" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Attendance</p>
            <p className="text-2xl font-bold text-foreground">{stats.attendancePercentage}%</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        variants={item} 
        className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
        onClick={() => onStatClick('courses')}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-foreground/10">
            <BookOpen className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Enrolled Courses</p>
            <p className="text-2xl font-bold text-foreground">{stats.enrolledCourses}</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
