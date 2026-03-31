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
  CheckCircle2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
      // Optimistic update
      setOptimisticEnrolledIds({ action: 'add', id: course.id });
      
      const formData = new FormData();
      formData.append('courseId', course.id);
      formData.append('courseCode', course.code);
      formData.append('courseName', course.name);
      formData.append('semester', String(course.semester));

      const result = await enrollInCourseAction(null, formData);
      if (result.success) {
        setEnrolledCourseIds(prev => [...prev, course.id]);
        toast.success(`Enrolled in ${course.code} successfully!`);
      } else {
        toast.error(result.error || 'Failed to enroll');
      }
    });
  };

  const handleDrop = async (courseId: string) => {
    startTransition(async () => {
      // Optimistic update
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
     // Simulate fetch or call real API
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
    <div className="space-y-6">
      <Tabs defaultValue="enrolled" className="space-y-6">
        <TabsList>
          <TabsTrigger value="available">Available Courses ({available.length})</TabsTrigger>
          <TabsTrigger value="enrolled">My Courses ({enrolled.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Input 
              placeholder="Search..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
               <SelectTrigger className="w-[180px]"><SelectValue placeholder="Department" /></SelectTrigger>
               <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
               </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          </div>
        </TabsContent>

        <TabsContent value="enrolled" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        </TabsContent>
      </Tabs>

      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent>
           {selectedCourse && (
             <div className="space-y-4">
                <DialogHeader>
                  <DialogTitle>{selectedCourse.code} - {selectedCourse.name}</DialogTitle>
                  <DialogDescription>{selectedCourse.description}</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4 text-sm">
                   <div>
                      <span className="text-muted-foreground">Credits:</span> {selectedCourse.credits}
                   </div>
                   <div>
                      <span className="text-muted-foreground">Semester:</span> {selectedCourse.semester}
                   </div>
                </div>
                <Button className="w-full" onClick={() => setShowDetailsDialog(false)}>Close</Button>
             </div>
           )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
