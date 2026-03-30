'use client';

import { motion } from 'framer-motion';
import { BookOpen, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CollegeQuickActions({ type }: { type: 'courses' | 'users' }) {
  if (type === 'courses') {
    return (
      <motion.div variants={item} className="card-elevated p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <Link href="/courses/add">
          <Button variant="outline" size="sm" className="justify-start w-full">
            <BookOpen className="w-4 h-4 mr-2" />
            New Course
          </Button>
        </Link>
        <Link href="/timetable" className="mt-2 block">
          <Button variant="outline" size="sm" className="justify-start w-full">
            <Calendar className="w-4 h-4 mr-2" />
            Schedule
          </Button>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div variants={item} className="card-elevated p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <Link href="/users/add">
        <Button variant="outline" size="sm" className="justify-start w-full">
          <Users className="w-4 h-4 mr-2" />
          Add Faculty
        </Button>
      </Link>
    </motion.div>
  );
}
