'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  departments: any[];
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function DepartmentOverviewCard({ departments }: Props) {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Department Overview</h2>
        <Link href="/departments">
          <Button variant="ghost" size="sm">
            View All
            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Link>
      </div>
      <div className="space-y-3">
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No department data available.</p>
        ) : (
          departments.slice(0, 5).map((dept, idx) => (
            <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{dept.name}</p>
                <p className="text-sm text-muted-foreground">{dept.students} students · {dept.faculty} faculty</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">{dept.attendance}%</p>
                  <p className="text-xs text-muted-foreground">Attendance</p>
                </div>
                <div className={`w-2 h-8 rounded-full ${dept.attendance >= 80 ? 'bg-green-500' : dept.attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} />
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
}
