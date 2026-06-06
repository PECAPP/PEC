'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, FileText } from 'lucide-react';

interface StatsProps {
  stats: {
    totalStudents: number;
    totalFaculty: number;
    totalCourses: number;
  };
  onTabChange: (tab: string) => void;
}

export function AdminStatsCards({ stats, onTabChange }: StatsProps) {
  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="card-elevated p-5 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onTabChange("users")}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Students</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalStudents}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.05 }} 
        className="card-elevated p-5 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onTabChange("users")}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-foreground/10">
            <BookOpen className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Faculty</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalFaculty}</p>
          </div>
        </div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        className="card-elevated p-5 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => onTabChange("courses")}
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-foreground/10">
            <FileText className="w-5 h-5 text-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Courses</p>
            <p className="text-2xl font-bold text-foreground">{stats.totalCourses}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
