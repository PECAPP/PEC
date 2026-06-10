'use client';
import { Badge, Button, ImageWithBlur } from "@pec/ui";
import { motion } from 'framer-motion';
import { CheckCircle, GraduationCap, X, ArrowRight, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Course } from '@pec/shared';

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
      className="card-elevated group overflow-hidden bg-white dark:bg-black/40 backdrop-blur-2xl border border-black/10 dark:border-white/10 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/20 hover:-translate-y-1.5 transition-all duration-500 rounded-sm shadow-sm dark:shadow-none"
    >
      <div className="h-40 w-full relative overflow-hidden bg-black/10 dark:bg-black/50">
        <ImageWithBlur 
          src={image}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-500 group-hover:opacity-100" />
        
        <div className="absolute top-4 left-4 flex gap-2 z-10">
          <Badge className="bg-black/60 text-white backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest uppercase py-1 px-3 shadow-sm">
             {course.code}
          </Badge>
          {enrolled && (
            <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold tracking-widest uppercase py-1 px-3 backdrop-blur-xl shadow-sm rounded-full">
              <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Enrolled
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
      
      <div className="p-5 space-y-5 relative">
        <div>
          <h3 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white group-hover:text-primary dark:group-hover:text-primary transition-colors line-clamp-1  dark:">
            {course.name}
          </h3>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 transition-colors group-hover:text-zinc-800 dark:group-hover:text-zinc-300">
             <User className="w-3.5 h-3.5 opacity-70" />
             <span className="truncate">{course.facultyName.replace(/\b[A-Z]+\b/g, m => m.charAt(0) + m.slice(1).toLowerCase())}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pb-2">
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Credits</span>
             <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{course.credits} Units</span>
             </div>
          </div>
          <div className="flex flex-col gap-1">
             <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Schedule</span>
             <div className="flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">Sem {course.semester}</span>
             </div>
          </div>
        </div>

        <div className="space-y-3 pt-4 border-t border-black/10 dark:border-white/10">
           <div className="flex justify-between items-center text-[10px] uppercase font-bold tracking-widest text-zinc-600 dark:text-zinc-400">
              <span>Enrollment Status</span>
              <span className={cn(isFull ? "text-destructive font-extrabold" : "text-primary font-extrabold")}>
                {course.enrolledStudents} / {course.maxStudents}
              </span>
           </div>
           <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden border border-black/5 dark:border-white/5 p-[1px]">
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

        <div className="flex gap-2 pt-3 relative z-20">
          {!enrolled && !isFull && onEnroll && (
             <Button 
              onClick={() => onEnroll(course)}
              className="flex-1 h-10 rounded-sm bg-primary text-primary-foreground font-bold text-[9px] uppercase tracking-widest shadow-glow hover:scale-[1.02] transition-all"
            >
              Enroll Now
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            onClick={() => onView(course)} 
            className={cn(
              "h-10 rounded-sm font-bold text-[9px] uppercase tracking-widest transition-all group/btn bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 text-zinc-800 dark:text-white border border-black/10 dark:border-white/10",
              (enrolled || isFull) ? "flex-1" : "px-5"
            )}
          >
             Catalog Details
             <ArrowRight className="w-3 h-3 ml-2 opacity-0 -translate-x-2 transition-all group-hover/btn:opacity-100 group-hover/btn:translate-x-0 text-primary" />
          </Button>

          {enrolled && onDrop && (
            <Button 
              variant="ghost" 
              className="h-10 w-10 rounded-sm bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20 shrink-0 transition-all"
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

