'use client';

import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AttendanceSummaryCard() {
  return (
    <motion.div variants={item} className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 h-full flex flex-col">
      <h2 className="text-lg font-semibold text-foreground mb-4">Attendance Summary</h2>
      <div className="flex flex-col xl:flex-row items-center justify-between gap-6 flex-1">
        <div className="text-center">
          <div className="relative w-28 h-28 mx-auto">
            <svg className="w-28 h-28 transform -rotate-90">
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-muted"
                strokeWidth="10"
                fill="none"
              />
              <circle
                cx="56"
                cy="56"
                r="48"
                className="stroke-primary"
                strokeWidth="10"
                fill="none"
                strokeDasharray={`${83 * 3.01} 301`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold">
              83%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Overall Average</p>
        </div>
        <div className="w-full xl:w-auto flex-1 space-y-3">
          <div className="p-3 rounded-md border border-border/50 flex justify-between items-center bg-muted/20">
            <span className="text-sm text-muted-foreground">Present Today</span>
            <span className="font-bold text-green-600 text-sm">7,245</span>
          </div>
          <div className="p-3 rounded-md border border-border/50 flex justify-between items-center bg-muted/20">
            <span className="text-sm text-muted-foreground">Absent Today</span>
            <span className="font-bold text-red-600 text-sm">1,175</span>
          </div>
          <div className="p-3 rounded-md border border-border/50 flex justify-between items-center bg-muted/20">
            <span className="text-sm text-muted-foreground">On Leave</span>
            <span className="font-bold text-yellow-600 text-sm">320</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
