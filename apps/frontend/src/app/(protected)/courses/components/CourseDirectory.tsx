'use client';

import { useState, useTransition, useOptimistic } from 'react';
import { 
  Search, 
  GraduationCap, 
  Loader2, 
  BookOpen, 
  Clock, 
  Plus, 
  X,
  CheckCircle2,
  Filter,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ImageWithBlur } from '@/components/ui/image-with-blur';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import { CourseCard } from './CourseCard';
import { toast } from 'sonner';
import { enrollInCourseAction, dropCourseAction } from '../actions';
import { Course } from '@/types/course';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface CourseDirectoryProps {
  initialCourses: Course[];
  initialEnrolledIds: string[];
  user: any;
  studentProfile?: any;
}

export function CourseDirectory({ initialCourses, initialEnrolledIds, user, studentProfile }: CourseDirectoryProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState(initialEnrolledIds);
  
  const [optimisticEnrolledIds, setOptimisticEnrolledIds] = useOptimistic(
    enrolledCourseIds,
    (state: string[], { action, id }: { action: 'add' | 'remove', id: string }) => {
      if (action === 'add') return [...state, id];
      return state.filter(cid => cid !== id);
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState(studentProfile?.department || 'all');
  const [semesterFilter, setSemesterFilter] = useState(studentProfile?.semester?.toString() || 'all');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleEnroll = async (course: Course) => {
    startTransition(async () => {
      setOptimisticEnrolledIds({ action: 'add', id: course.id });
      
      const formData = new FormData();
      formData.append('courseId', course.id);
      formData.append('courseCode', course.code);
      formData.append('courseName', course.name);
      formData.append('semester', String(course.semester));

      const result = await enrollInCourseAction(null, formData);
      if (result.success) {
        setEnrolledCourseIds(prev => [...prev, course.id]);
        toast.success(`Registered for ${course.code}`);
      } else {
        toast.error(result.error || 'Failed to register');
      }
    });
  };

  const handleDrop = async (courseId: string) => {
    if (!confirm('Are you sure you want to drop this course?')) return;
    startTransition(async () => {
      setOptimisticEnrolledIds({ action: 'remove', id: courseId });
      
      const result = await dropCourseAction(courseId);
      if (result.success) {
        setEnrolledCourseIds(prev => prev.filter(id => id !== courseId));
        toast.success('Course dropped successfully');
      } else {
        toast.error(result.error || 'Failed to drop course');
      }
    });
  };

  const fetchCourseSchedule = async (courseId: string) => {
     setLoadingSchedule(true);
     setTimeout(() => setLoadingSchedule(false), 500);
  };

  const departments = [...new Set(courses.map(c => c.department))];

  const getCourseImage = (dept: string, name: string) => {
    const deptImages: Record<string, string> = {
      'Computer Science': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
      'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
      'Mechanical': 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80',
      'Civil': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80',
      'Electrical': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    };
    return deptImages[dept] || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80';
  };

  const filtered = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesSem = semesterFilter === 'all' || course.semester.toString() === semesterFilter;
    return matchesSearch && matchesDept && matchesSem;
  });

  const available = filtered.filter(c => {
    const isEnrolled = optimisticEnrolledIds.includes(c.id);
    if (isEnrolled) return false;
    
    if (user.role === 'student' && studentProfile) {
       const sameDept = c.department === studentProfile.department;
       const sameSem = c.semester === studentProfile.semester;
       return sameDept && sameSem;
    }
    
    return true;
  });
  
  const enrolled = courses.filter(c => optimisticEnrolledIds.includes(c.id));

  return (
    <div className="space-y-8 pb-10">
      <Tabs defaultValue="enrolled" className="space-y-10 group/tabs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <TabsList className="h-14 p-1.5 bg-muted/30 rounded-2xl border border-border/40 gap-1">
            <TabsTrigger 
              value="enrolled" 
              className="rounded-xl px-8 h-full font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              My Curriculum ({enrolled.length})
            </TabsTrigger>
            <TabsTrigger 
              value="available" 
              className="rounded-xl px-8 h-full font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              Open Enrollment ({available.length})
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-3">
             <div className="relative group/search flex-1 md:w-64">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 transition-colors group-focus-within/search:text-primary" />
               <Input 
                placeholder="Search catalog..." 
                className="h-14 pl-11 rounded-2xl bg-muted/20 border-border/40 focus:bg-background transition-all font-bold placeholder:font-normal"
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
               />
             </div>
             
             <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
               <SelectTrigger className="h-14 w-[180px] rounded-2xl bg-muted/20 border-border/40 font-bold transition-all">
                 <div className="flex items-center gap-2"><Filter className="w-3.5 h-3.5" /><SelectValue placeholder="Org" /></div>
               </SelectTrigger>
               <SelectContent className="rounded-xl border-border/40 shadow-xl">
                  <SelectItem value="all" className="font-bold text-[10px] uppercase tracking-widest">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d} className="font-bold text-[10px] uppercase tracking-widest">{d}</SelectItem>)}
               </SelectContent>
             </Select>
          </div>
        </div>

        <TabsContent value="available" className="mt-0 focus-visible:outline-none">
          <AnimatePresence mode="wait">
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {available.map(course => (
                <CourseCard 
                  key={course.id} 
                  course={course} 
                  enrolled={false} 
                  image={getCourseImage(course.department, course.name)}
                  onView={c => { setSelectedCourse(c); fetchCourseSchedule(c.id); setShowDetailsDialog(true); }}
                  onEnroll={handleEnroll}
                />
              ))}
            </motion.div>
          </AnimatePresence>
          {available.length === 0 && (
            <div className="py-32 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center gap-6">
               <div className="p-6 bg-background rounded-full border border-border/40 shadow-sm"><Layers className="w-8 h-8 text-muted-foreground/40" /></div>
               <p className="text-sm font-medium text-muted-foreground italic">No matching elective courses identified in the catalog.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="enrolled" className="mt-0 focus-visible:outline-none">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enrolled.map(course => (
              <CourseCard 
                key={course.id} 
                course={course} 
                enrolled={true} 
                image={getCourseImage(course.department, course.name)}
                onView={c => { setSelectedCourse(c); fetchCourseSchedule(c.id); setShowDetailsDialog(true); }}
                onDrop={handleDrop}
              />
            ))}
          </div>
          {enrolled.length === 0 && (
            <div className="py-32 text-center rounded-3xl border-2 border-dashed border-border/40 bg-muted/5 flex flex-col items-center gap-6">
               <div className="p-6 bg-background rounded-full border border-border/40 shadow-sm"><BookOpen className="w-8 h-8 text-muted-foreground/40" /></div>
               <p className="text-sm font-medium text-muted-foreground italic">You are not currently enrolled in any courses for the active semester.</p>
               <Button variant="outline" className="h-12 rounded-xl px-8 font-bold text-[10px] uppercase tracking-widest border-primary/20 text-primary shadow-sm" onClick={() => (document.querySelector('[value="available"]') as any)?.click()}>Explore Electives</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-3xl border-border/40 bg-card/95 backdrop-blur-xl">
           {selectedCourse && (
             <div className="space-y-0">
                <div className="relative h-48 w-full">
                   <ImageWithBlur src={getCourseImage(selectedCourse.department, selectedCourse.name)} alt={selectedCourse.name} className="w-full h-full object-cover" />
                   <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                   <div className="absolute bottom-6 left-8 right-8 flex items-end justify-between">
                      <div className="space-y-1">
                        <Badge className="bg-primary/20 text-primary border-primary/20 backdrop-blur-sm px-3 py-1 font-bold text-[10px] tracking-widest uppercase mb-1">{selectedCourse.code}</Badge>
                        <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedCourse.name}</h2>
                      </div>
                   </div>
                </div>
                
                <div className="p-8 space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-6 border-y border-border/20">
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Faculty lead</span>
                         <p className="text-sm font-bold text-foreground/80">{selectedCourse.facultyName}</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Academic Units</span>
                         <p className="text-sm font-bold text-foreground/80">{selectedCourse.credits} Credits</p>
                      </div>
                      <div className="space-y-1">
                         <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">Institutional Level</span>
                         <p className="text-sm font-bold text-foreground/80">Semester {selectedCourse.semester}</p>
                      </div>
                   </div>

                   <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-widest text-primary">Catalog Description</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed font-medium">
                        {selectedCourse.description || "Comprehensive curriculum details for this institutional module will be provided during the orientation session."}
                      </p>
                   </div>
                   
                   <div className="flex gap-4 pt-4">
                      <Button className="flex-1 h-12 rounded-xl bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest shadow-glow" onClick={() => setShowDetailsDialog(false)}>
                         Acknowledge
                      </Button>
                      <Button variant="outline" className="h-12 rounded-xl px-12 font-bold text-[10px] uppercase tracking-widest" onClick={() => setShowDetailsDialog(false)}>Close</Button>
                   </div>
                </div>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

