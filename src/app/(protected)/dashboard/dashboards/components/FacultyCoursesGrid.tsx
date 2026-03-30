'use client';

import { motion } from 'framer-motion';
import { Users, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
  onManage: () => void;
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function FacultyCoursesGrid({ onManage }: Props) {
  return (
    <motion.div variants={item} className="card-elevated p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
        <Button variant="ghost" size="sm" onClick={onManage}>
          Manage
          <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <CourseCard
          code="CS201"
          name="Data Structures & Algorithms"
          students={187}
          progress={65}
          avgAttendance={86}
        />
        <CourseCard
          code="CS301"
          name="Database Management Systems"
          students={116}
          progress={58}
          avgAttendance={82}
        />
        <CourseCard
          code="CS401"
          name="Machine Learning"
          students={94}
          progress={42}
          avgAttendance={78}
        />
        <CourseCard
          code="CS202"
          name="Object Oriented Programming"
          students={148}
          progress={70}
          avgAttendance={84}
        />
      </div>
    </motion.div>
  );
}

function CourseCard({ code, name, students, progress, avgAttendance }: any) {
  return (
    <div className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-medium text-accent">{code}</span>
          <p className="font-semibold text-foreground">{name}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {students}
        </div>
      </div>
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Syllabus</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Attendance</span>
        <span className={`text-sm font-medium ${avgAttendance >= 80 ? 'text-success' : avgAttendance >= 75 ? 'text-warning' : 'text-destructive'}`}>
          {avgAttendance}%
        </span>
      </div>
    </div>
  );
}
