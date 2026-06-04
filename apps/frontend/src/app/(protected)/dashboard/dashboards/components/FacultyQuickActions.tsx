'use client';

import { motion } from 'framer-motion';
import { ClipboardCheck, FileText, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  onAction: (path: string) => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FacultyQuickActions({ onAction }: Props) {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => onAction('/attendance')}>
          <ClipboardCheck className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </div>
    </motion.div>
  );
}
