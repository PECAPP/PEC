'use client';

import { motion } from 'framer-motion';
import { Users, BookOpen, FileText } from 'lucide-react';
import { StatCard } from '@pec/ui';

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
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        onClick={() => onTabChange("users")}
        className="cursor-pointer h-full"
      >
        <StatCard 
          className="h-full"
          label="Total Students" 
          value={stats.totalStudents} 
          icon={<Users className="w-5 h-5" />} 
          colorVariant="success" 
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.05 }} 
        onClick={() => onTabChange("users")}
        className="cursor-pointer h-full"
      >
        <StatCard 
          className="h-full"
          label="Total Faculty" 
          value={stats.totalFaculty} 
          icon={<BookOpen className="w-5 h-5" />} 
          colorVariant="info" 
        />
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }} 
        onClick={() => onTabChange("courses")}
        className="cursor-pointer h-full"
      >
        <StatCard 
          className="h-full"
          label="Total Courses" 
          value={stats.totalCourses} 
          icon={<FileText className="w-5 h-5" />} 
          colorVariant="warning" 
        />
      </motion.div>
    </div>
  );
}
