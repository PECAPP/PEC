'use client';

import { motion } from 'framer-motion';
import { ArrowUpRight, UserCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Props {
  recentAdmissions: any[];
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function RecentAdmissionsCard({ recentAdmissions }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-6">
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Admissions</h2>
            <Link href="/users">
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </Link>
          </div>
          <div className="space-y-3">
            {recentAdmissions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent admissions.</p>
            ) : (
              recentAdmissions.map((student) => (
                <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <UserCheck className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.department || 'N/A'} · {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${student.status === 'active' ? 'bg-green-500/10 text-green-600 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20'}`}>
                    {student.status === 'active' ? 'Approved' : 'Pending'}
                  </span>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
      <div className="space-y-6">
        <motion.div variants={item} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-foreground">Action Required</h3>
              <p className="text-sm text-muted-foreground mt-1">Pending profile approvals</p>
              <Link href="/users?filter=pending">
                <Button size="sm" variant="link" className="px-0 h-auto mt-2 text-orange-600">Review</Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
