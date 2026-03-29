'use client';

import { motion } from 'framer-motion';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function AttendanceSummaryCard() {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Attendance Summary</h2>
      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-muted"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                className="stroke-primary"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${83 * 3.51} 351`}
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
              83%
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">Overall Average</p>
        </div>
        <div className="flex-1 w-full space-y-4">
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Present Today</span>
            <span className="font-bold text-green-600 text-lg">7,245</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">Absent Today</span>
            <span className="font-bold text-red-600 text-lg">1,175</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
            <span className="text-muted-foreground">On Leave</span>
            <span className="font-bold text-yellow-600 text-lg">320</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
