'use client';

import { motion } from 'framer-motion';
import { CheckCircle, Users, GraduationCap, Plus, X, ArrowRight, BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ImageWithBlur } from '@/components/ui/image-with-blur';
import { cn } from '@/lib/utils';
import { Course } from '@/types/course';

interface CourseCardProps {
  course: Course;
  enrolled: boolean;
  image: string;
  onView: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  onDrop?: (courseId: string) => void;
}

export function CourseCard({ 
  course, 
  enrolled, 
  image,
  onView, 
  onEnroll, 
  onDrop 
}: CourseCardProps) {
  const isFull = course.enrolledStudents >= course.maxStudents;
  const enrollmentRatio = (course.enrolledStudents / course.maxStudents) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-20px" }}
      className="card-elevated group overflow-hidden bg-card/90 backdrop-blur-sm border-border hover:border-primary/40 transition-all duration-300"
    >
      <div className="h-44 w-full relative overflow-hidden bg-muted/20">
        <ImageWithBlur 
          src={image}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-90" />
        
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className="bg-background/80 backdrop-blur-md border-border/40 text-[10px] font-bold tracking-widest uppercase py-1 px-3">
             {course.code}
          </Badge>
          {enrolled && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] font-bold tracking-widest uppercase py-1 px-3 backdrop-blur-md">
              <CheckCircle className="w-3 h-3 mr-1.5" /> Enrolled
            </Badge>
          )}
        </div>

        {isFull && !enrolled && (
          <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center z-20">
            <Badge variant="destructive" className="font-bold tracking-widest uppercase px-6 py-2 shadow-xl shadow-destructive/20 border-destructive/20">
               Full Capacity
            </Badge>
          </div>
        )}
      </div>
      
      <div className="p-6 space-y-5">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {course.name}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
             <User className="w-3.5 h-3.5" />
             <span className="truncate">{course.facultyName}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-1">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Credits</span>
             <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary/60" />
                <span className="text-sm font-bold text-foreground/80">{course.credits} Units</span>
             </div>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">Schedule</span>
             <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary/60" />
                <span className="text-sm font-bold text-foreground/80">Sem {course.semester}</span>
             </div>
          </div>
        </div>

        <div className="space-y-2.5 pt-4 border-t border-border/20">
           <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-muted-foreground/60">
              <span>Enrollment Status</span>
              <span className={cn(isFull ? "text-destructive" : "text-primary")}>
                {course.enrolledStudents} / {course.maxStudents}
              </span>
           </div>
           <div className="h-1.5 w-full bg-muted/40 rounded-full overflow-hidden border border-border/10 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.min(enrollmentRatio, 100)}%` }}
                viewport={{ once: true }}
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isFull ? "bg-destructive shadow-glow-destructive" : "bg-primary shadow-glow"
                )}
              />
           </div>
        </div>

        <div className="flex gap-3 pt-2">
          {!enrolled && !isFull && onEnroll && (
             <Button 
              onClick={() => onEnroll(course)}
              className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-glow hover:scale-[1.02] transition-all"
            >
              Enroll Now
            </Button>
          )}
          
          <Button 
            variant="outline" 
            onClick={() => onView(course)} 
            className={cn(
              "h-12 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all",
              (enrolled || isFull) ? "flex-1" : "px-6"
            )}
          >
             Catalog Details
          </Button>

          {enrolled && onDrop && (
            <Button 
              variant="destructive"
              className="h-12 w-12 rounded-xl text-destructive hover:bg-destructive/5 shrink-0"
              onClick={() => onDrop(course.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

const User = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
