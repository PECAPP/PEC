'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function LowAttendanceAlert() {
  return (
    <motion.div variants={item} className="p-4 rounded-xl bg-warning/10 border border-warning/20">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
        <div>
          <h3 className="font-medium text-foreground">Low Attendance Alert</h3>
          <p className="text-sm text-muted-foreground mt-1">
            8 students in CS201 are below 75% attendance threshold
          </p>
          <Button variant="link" size="sm" className="px-0 mt-1 h-auto">
            View Students →
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
