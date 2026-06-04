'use client';

import { motion } from 'framer-motion';
import { GraduationCap, Users, BookOpen, CreditCard } from 'lucide-react';

interface Props {
  stats: any;
  formatCurrency: (amount: number) => string;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CollegeAdminStatsGrid({ stats, formatCurrency }: Props) {
  return (
    <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard
        icon={GraduationCap}
        label="Total Students"
        value={stats.totalStudents.toLocaleString()}
        subtext="Active enrollment"
        trend={`+${stats.studentsDiff} this month`}
        trendUp={true}
      />
      <StatCard
        icon={Users}
        label="Faculty Members"
        value={stats.totalFaculty.toLocaleString()}
        subtext="Across departments"
      />
      <StatCard
        icon={BookOpen}
        label="Active Courses"
        value={stats.activeCourses.toLocaleString()}
        subtext="This semester"
      />
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, trend, trendUp, iconColor = 'text-primary' }: any) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );
}
