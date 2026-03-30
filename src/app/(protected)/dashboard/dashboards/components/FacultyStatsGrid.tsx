'use client';

import { motion } from 'framer-motion';
import { BookOpen, Users, ClipboardCheck, FileText } from 'lucide-react';

interface Props {
  stats: {
    activeCount: number;
    studentCount: number;
    avgAttendance?: number;
    pendingReviews?: number;
  };
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FacultyStatsGrid({ stats }: Props) {
  return (
    <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        icon={BookOpen}
        label="Active Courses"
        value={String(stats.activeCount)}
        subtext="This semester"
      />
      <StatCard
        icon={Users}
        label="Total Students"
        value={String(stats.studentCount)}
        subtext="Across all courses"
      />
      <StatCard
        icon={ClipboardCheck}
        label="Avg Attendance"
        value={`${Math.max(0, Math.min(100, Number(stats.avgAttendance || 0)))}%`}
        subtext="This month"
        iconColor="text-success"
      />
      <StatCard
        icon={FileText}
        label="Pending Reviews"
        value={String(stats.pendingReviews || 0)}
        subtext="Assignments to grade"
        iconColor="text-warning"
      />
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, iconColor = 'text-primary' }: any) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );
}
