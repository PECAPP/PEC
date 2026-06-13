'use client';
import { Button } from "@pec/ui";


import { motion } from 'framer-motion';
import { BookOpen, Calendar, Users, UserPlus, Bell } from 'lucide-react';

import Link from 'next/link';

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function CollegeQuickActions({ type }: { type: 'courses' | 'users' }) {
  if (type === 'courses') {
    return (
      <motion.div variants={item} className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
        <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
        <Link href={"/courses/add" as any}>
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
    <motion.div variants={item} className="bg-card border border-border/40 rounded-sm shadow-sm p-4 md:p-6">
      <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-3">
        <Link href={"/directory/users/add" as any}>
          <Button variant="outline" size="sm" className="justify-start w-full bg-muted/20 hover:bg-muted/40 hover:text-foreground border-white/5 transition-colors">
            <Users className="w-4 h-4 mr-2 text-emerald-500" />
            Add Faculty
          </Button>
        </Link>
        <Link href={"/directory/users/add" as any}>
          <Button variant="outline" size="sm" className="justify-start w-full bg-muted/20 hover:bg-muted/40 hover:text-foreground border-white/5 transition-colors">
            <UserPlus className="w-4 h-4 mr-2 text-blue-500" />
            Add Student
          </Button>
        </Link>
        <Link href={"/courses/add" as any}>
          <Button variant="outline" size="sm" className="justify-start w-full bg-muted/20 hover:bg-muted/40 hover:text-foreground border-white/5 transition-colors">
            <BookOpen className="w-4 h-4 mr-2 text-amber-500" />
            New Course
          </Button>
        </Link>
        <Link href={"/communications" as any}>
          <Button variant="outline" size="sm" className="justify-start w-full bg-muted/20 hover:bg-muted/40 hover:text-foreground border-white/5 transition-colors">
            <Bell className="w-4 h-4 mr-2 text-purple-500" />
            Send Notice
          </Button>
        </Link>
      </div>
    </motion.div>
  );
}
