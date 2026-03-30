'use client';

import { BookOpen, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/AsyncState';
import { Course } from '@/types';

interface Props {
  enrolledCoursesList: Course[];
  onViewAll: () => void;
  onCourseClick: (courseId: string) => void;
}

export function EnrolledCoursesCard({ enrolledCoursesList, onViewAll, onCourseClick }: Props) {
  return (
    <div className="xl:col-span-2 card-elevated ui-card-pad">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-accent" />
          My Enrolled Courses
        </h2>
        <Button variant="ghost" size="sm" onClick={onViewAll}>
          View All
          <ArrowUpRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {enrolledCoursesList.length === 0 ? (
          <EmptyState
            className="col-span-2"
            title="No active enrollments"
            description="Enroll in a course to see your course cards here."
            actionLabel="Browse courses"
            onAction={onViewAll}
          />
        ) : (
          enrolledCoursesList.slice(0, 4).map((course) => (
            <div 
              key={course.id} 
              className="p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 hover:border-accent transition-all group cursor-pointer relative overflow-hidden"
              onClick={() => onCourseClick(course.id)}
            >
              <div className="flex items-start justify-between relative z-10">
                <div>
                  <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm">{course.code}</Badge>
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.name}</p>
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider relative z-10">
                <span>{course.credits} Credits</span>
                <span className="group-hover:text-primary transition-colors">Sem {course.semester}</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          ))
        )}
        {enrolledCoursesList.length > 4 && (
          <div className="col-span-2 flex justify-center mt-2">
            <Button variant="link" size="sm" onClick={onViewAll} className="text-xs text-muted-foreground">
              +{enrolledCoursesList.length - 4} more courses
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
