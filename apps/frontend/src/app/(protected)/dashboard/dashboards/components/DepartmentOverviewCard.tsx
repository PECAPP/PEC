'use client';
import { Button } from "@pec/ui";


import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

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
    <motion.div variants={item} className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Department Overview</h2>
        <Link href="/directory/departments">
          <Button variant="ghost" size="sm">
            View All
            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
          </Button>
        </Link>
      </div>
      <div className="flex flex-col gap-1 flex-1">
        {departments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No department data available.</p>
        ) : (
          departments.slice(0, 6).map((dept, idx) => (
            <div key={idx} className="py-3 border-b border-white/5 last:border-0 flex items-center justify-between group hover:bg-muted/10 px-2 -mx-2 rounded-md transition-colors">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate group-hover:text-primary transition-colors">{dept.name}</p>
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
