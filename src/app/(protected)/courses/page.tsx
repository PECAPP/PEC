'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Search,
  Users,
  GraduationCap,
  CheckCircle,
  X,
  Upload,
  Download,
  Clock,
  MapPin,
} from 'lucide-react';
import { ImageWithBlur, CourseSkeleton } from '@/components/ui/image-with-blur';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
;
import { usePermissions } from '@/hooks/usePermissions';
import dynamic from 'next/dynamic';

import PDFExportButton from '@/components/common/PDFExportButton';
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import api from '@/lib/api';

const BulkUpload = dynamic(() => import('@/components/BulkUpload'), {
  ssr: false,
  loading: () => <div className="p-8 text-center text-muted-foreground animate-pulse">Loading uploader...</div>
});

interface Course {
  id: string;
  code: string;
  name: string;
  department: string;
  semester: number;
  credits: number;
  facultyId?: string;
  facultyName: string;
  maxStudents: number;
  enrolledStudents: number;
  schedule?: {
    day: string;
    startTime: string;
    endTime: string;
    room: string;
  }[];
  description: string;
}

export default function Courses() {
  const router = useRouter();
  const { isAdmin, isFaculty, isStudent, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [semesterFilter, setSemesterFilter] = useState('all');
  
  // Admin/Faculty states
  const [showCourseDialog, setShowCourseDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [courseForm, setCourseForm] = useState({
    code: '',
    name: '',
    department: '',
    semester: 1,
    credits: 3,
    facultyName: '',
    maxStudents: 60,
    description: '',
  });
  const [scheduleSlots, setScheduleSlots] = useState<{ day: string; startTime: string; endTime: string; room: string }[]>([]);

  const addScheduleSlot = () => {
    setScheduleSlots([...scheduleSlots, { day: 'Monday', startTime: '09:00', endTime: '10:00', room: '' }]);
  };

  const removeScheduleSlot = (index: number) => {
    setScheduleSlots(scheduleSlots.filter((_, i) => i !== index));
  };

  const updateScheduleSlot = (index: number, field: string, value: string) => {
    const updated = [...scheduleSlots];
    updated[index] = { ...updated[index], [field]: value };
    setScheduleSlots(updated);
  };

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        await api.post('/courses', {
          code: row.code,
          name: row.name,
          department: row.department,
          semester: parseInt(row.semester),
          credits: parseInt(row.credits),
          instructor: row.facultyName || row.instructor || 'TBA',
          status: 'active',
        });
        successCount++;
      } catch (error) {
        failCount++;
        errors.push(`${row.code}: ${(error as Error).message}`);
      }
    }

    await fetchCourses();
    return { success: successCount, failed: failCount, errors };
  };

  const exportCourses = async () => {
    const exportData = courses.map(c => ({
      code: c.code,
      name: c.name,
      department: c.department,
      semester: c.semester,
      credits: c.credits,
      facultyName: c.facultyName,
      maxStudents: c.maxStudents,
      enrolledStudents: c.enrolledStudents
    }));

    const XLSX = await import('xlsx');
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');
    XLSX.writeFile(workbook, `courses_export_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Courses exported successfully!');
  };

  const bulkUploadTemplate = [
    'code',
    'name',
    'department',
    'semester',
    'credits',
    'facultyName',
    'maxStudents',
    'description'
  ];

  const sampleBulkData = [
    {
      code: 'CS101',
      name: 'Intro to Computer Science',
      department: 'Computer Science',
      semester: '1',
      credits: '4',
      facultyName: 'Dr. Smith',
      maxStudents: '60',
      description: 'Introduction to programming'
    }
  ];

  // Student states
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [courseSchedule, setCourseSchedule] = useState<{day: string; timeSlot: string; room: string}[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Deterministic Keyword Mapping for Images
  const getCourseImage = (dept: string, name: string) => {
     // Fallback map for stability
     const deptImages: Record<string, string> = {
        'Computer Science': 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', // Coding laptop
        'Electronics': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', // Chip
        'Mechanical': 'https://images.unsplash.com/photo-1537462715879-360eeb61a0ad?w=800&q=80', // Gears
        'Civil': 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80', // Architecture
        'Electrical': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80', // Wires
        'Mathematics': 'https://images.unsplash.com/photo-1635372722656-389f87a941b7?w=800&q=80', // Math
        'Physics': 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=800&q=80', // Physics
     };

     // Keyword-based overrides
     const nameLower = name.toLowerCase();
     if(nameLower.includes('data')) return 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80';
     if(nameLower.includes('web')) return 'https://images.unsplash.com/photo-1547658719-da2b51169166?w=800&q=80';
     if(nameLower.includes('ai') || nameLower.includes('intelligence')) return 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80';
     if(nameLower.includes('network')) return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80';
     if(nameLower.includes('design')) return 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80';

     return deptImages[dept] || 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80'; // Default book
  };

  // Fetch schedule from timetable collection when viewing a course
  const fetchCourseSchedule = async (courseId: string) => {
    setLoadingSchedule(true);
    setCourseSchedule([]);
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/timetable', {
        params: { limit: 200, offset: 0, courseId },
      });
      const schedule = (response.data.data || []).map((data: any) => {
        return {
          day: data.day,
          timeSlot: data.timeSlot || `${data.startTime}-${data.endTime}`,
          room: data.room || 'TBD'
        };
      });
      // Sort by day order, then by time
      const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      schedule.sort((a, b) => {
        const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
        if (dayDiff !== 0) return dayDiff;
        return a.timeSlot.localeCompare(b.timeSlot);
      });
      setCourseSchedule(schedule);
    } catch (error) {
      console.error('Error fetching course schedule:', error);
    } finally {
      setLoadingSchedule(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      router.replace('/auth');
      return;
    }

    const loadData = async () => {
      try {
        await fetchCourses();

        // Fetch enrollments for students
        if (isStudent && user.uid) {
          type ApiResponse<T> = { success: boolean; data: T; meta?: any };
          const enrollmentsResponse = await api.get<ApiResponse<any[]>>('/enrollments', {
            params: { limit: 100, offset: 0, studentId: user.uid, status: 'active' },
          });
          const enrolledIds = (enrollmentsResponse.data.data || []).map((item: any) => item.courseId);
          setEnrolledCourseIds(enrolledIds);
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user, isStudent, router]);

  const fetchCourses = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const response = await api.get<ApiResponse<any[]>>('/courses', {
        params: { limit: 200, offset: 0 },
      });

      let coursesData = (response.data.data || []).map((course: any) => ({
        ...course,
        facultyName: course.facultyName || course.instructor || 'TBA',
        maxStudents: Number(course.maxStudents || 60),
        enrolledStudents: Number(course.enrolledStudents || 0),
        description: course.description || '',
      })) as Course[];
      
      if (isFaculty && user?.uid) {
        const byInstructor = coursesData.filter((course) =>
          String((course as any).instructor || course.facultyName || '')
            .toLowerCase()
            .includes(String(user.fullName || '').toLowerCase()),
        );

        if (byInstructor.length > 0) {
          coursesData = byInstructor;
        }
      }
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleEditCourse = (course: Course) => {
    // Faculty can only edit courses in their department
    if (isFaculty && !isAdmin) {
      toast.error('You can only edit courses in your department');
      return;
    }
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      facultyName: course.facultyName || '',
      maxStudents: course.maxStudents,
      description: course.description || '',
    });
    setShowCourseDialog(true);
  };
  // ============ ADMIN FUNCTIONS ============
  const handleCreateCourse = async () => {
    try {
      await api.post('/courses', {
        code: courseForm.code,
        name: courseForm.name,
        credits: Number(courseForm.credits),
        instructor: courseForm.facultyName || 'TBA',
        department: courseForm.department,
        semester: Number(courseForm.semester),
        status: 'active',
      });
      toast.success('Course created successfully!');
      setShowCourseDialog(false);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Failed to create course');
    }
  };

  const handleUpdateCourse = async () => {
    if (!editingCourse) return;
    try {
      await api.patch(`/courses/${editingCourse.id}`, {
        code: courseForm.code,
        name: courseForm.name,
        credits: Number(courseForm.credits),
        instructor: courseForm.facultyName || 'TBA',
        department: courseForm.department,
        semester: Number(courseForm.semester),
      });
      toast.success('Course updated successfully!');
      setShowCourseDialog(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchCourses();
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;
    try {
      await api.delete(`/courses/${courseId}`);
      toast.success('Course deleted successfully!');
      fetchCourses();
    } catch (error) {
      console.error('Error deleting course:', error);
      toast.error('Failed to delete course');
    }
  };

  const resetCourseForm = () => {
    setCourseForm({
      code: '',
      name: '',
      department: '',
      semester: 1,
      credits: 3,
      facultyName: '',
      maxStudents: 60,
      description: '',
    });
    setScheduleSlots([]);
  };

  const openEditDialog = (course: Course) => {
    setEditingCourse(course);
    setCourseForm({
      code: course.code,
      name: course.name,
      department: course.department,
      semester: course.semester,
      credits: course.credits,
      facultyName: course.facultyName,
      maxStudents: course.maxStudents,
      description: course.description,
    });
    setScheduleSlots(course.schedule || []);
    setShowCourseDialog(true);
  };

  // ============ STUDENT FUNCTIONS ============
  const handleEnroll = async (course: Course) => {
    if (!user?.uid || !isStudent) return;

    setEnrolling(true);
    try {
      if (enrolledCourseIds.includes(course.id)) {
        toast.error('Already enrolled in this course');
        return;
      }

      if (course.enrolledStudents >= course.maxStudents) {
        toast.error('Course is full');
        return;
      }

      await api.post('/enrollments', {
        studentId: user.uid,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        semester: course.semester,
        status: 'active',
      });

      setEnrolledCourseIds([...enrolledCourseIds, course.id]);
      await fetchCourses();
      toast.success(`Enrolled in ${course.code} successfully!`);
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error enrolling:', error);
      toast.error('Failed to enroll in course');
    } finally {
      setEnrolling(false);
    }
  };

  const handleDrop = async (courseId: string) => {
    if (!user?.uid || !isStudent) return;

    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const enrollmentResponse = await api.get<ApiResponse<any[]>>('/enrollments', {
        params: { limit: 200, offset: 0, studentId: user.uid, courseId, status: 'active' },
      });
      const enrollmentData = enrollmentResponse.data.data || [];

      if (enrollmentData.length === 0) {
        toast.error('Enrollment not found');
        return;
      }

      const enrollmentDoc = enrollmentData[0];
      await api.patch(`/enrollments/${enrollmentDoc.id}`, {
        status: 'dropped',
      });

      setEnrolledCourseIds(enrolledCourseIds.filter(id => id !== courseId));
      await fetchCourses();
      toast.success('Course dropped successfully');
    } catch (error) {
      console.error('Error dropping course:', error);
      toast.error('Failed to drop course');
    }
  };

  // ============ FILTERS ============
  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'all' || course.department === departmentFilter;
    const matchesSem = semesterFilter === 'all' || course.semester.toString() === semesterFilter;
    
    // For faculty/admin, they see all courses in their view, but search applies
    if (isAdmin || isFaculty) {
      return matchesSearch && matchesDept && matchesSem;
    }
    
    return matchesSearch && matchesDept && matchesSem;
  });

  const availableCourses = filteredCourses.filter(c => !enrolledCourseIds.includes(c.id));
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  const departments = [...new Set(courses.map(c => c.department))];

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-28 rounded-md" />
      </div>
    );
  }

  // ============ ADMIN/FACULTY VIEW ============
  if (isAdmin || isFaculty) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
            <p className="text-muted-foreground mt-1">Manage all courses in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <PDFExportButton
              onExport={async () => {
                const { exportCourseListPDF } = await import('@/lib/pdfExport');
                exportCourseListPDF(filteredCourses);
              }}
              label="Export PDF"
              variant="outline"
              className="w-full sm:w-auto"
            />
            <Button variant="outline" onClick={exportCourses} className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="w-full sm:w-auto">
              <Upload className="w-4 h-4 mr-2" />
              Bulk Upload
            </Button>
            <Button onClick={() => { resetCourseForm(); setEditingCourse(null); setShowCourseDialog(true); }} className="w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" />
              Add Course
            </Button>
          </div>
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
          <div className="card-elevated ui-card-pad">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Courses</p>
                <p className="text-2xl font-bold text-foreground">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="card-elevated ui-card-pad">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-success/10">
                <Users className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
                <p className="text-2xl font-bold text-foreground">{courses.reduce((sum, c) => sum + (c.enrolledStudents || 0), 0)}</p>
              </div>
            </div>
          </div>
          <div className="card-elevated ui-card-pad">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-accent/10">
                <BookOpen className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Departments</p>
                <p className="text-2xl font-bold text-foreground">{departments.length}</p>
              </div>
            </div>
          </div>
        </div>

        <Input
          placeholder="Search courses..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <div className="card-elevated overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-muted/30 border-b border-border">
                <tr>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Code</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Department</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Semester</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Credits</th>
                  <th className="text-center p-4 text-sm font-medium text-muted-foreground">Enrolled</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-4">
                      <EmptyState title="No courses found" description="Try a different search or add a new course." />
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => (
                    <tr key={course.id} className="hover:bg-muted/20">
                      <td className="p-4 font-medium text-foreground">{course.code}</td>
                      <td className="p-4 text-foreground">{course.name}</td>
                      <td className="p-4 text-muted-foreground">{course.department}</td>
                      <td className="p-4 text-center text-muted-foreground">{course.semester}</td>
                      <td className="p-4 text-center text-muted-foreground">{course.credits}</td>
                      <td className="p-4 text-center">
                        <Badge variant="outline">{course.enrolledStudents || 0}/{course.maxStudents}</Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => openEditDialog(course)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCourse(course.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Admin Course Dialog */}
        <Dialog open={showCourseDialog} onOpenChange={setShowCourseDialog}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Create New Course'}</DialogTitle>
              <DialogDescription>{editingCourse ? 'Update course details' : 'Add a new course'}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Course Code *</label>
                  <Input value={courseForm.code} onChange={(e) => setCourseForm({ ...courseForm, code: e.target.value })} placeholder="CS301" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Course Name *</label>
                  <Input value={courseForm.name} onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })} placeholder="Data Structures" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Department</label>
                  <Input value={courseForm.department} onChange={(e) => setCourseForm({ ...courseForm, department: e.target.value })} placeholder="Computer Science" className="mt-1" />
                </div>
                <div>
                  <label className="text-sm font-medium">Faculty Name</label>
                  <Input value={courseForm.facultyName} onChange={(e) => setCourseForm({ ...courseForm, facultyName: e.target.value })} placeholder="Dr. John Smith" className="mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Semester</label>
                  <Input type="number" value={courseForm.semester} onChange={(e) => setCourseForm({ ...courseForm, semester: parseInt(e.target.value) })} className="mt-1" min="1" max="8" />
                </div>
                <div>
                  <label className="text-sm font-medium">Credits</label>
                  <Input type="number" value={courseForm.credits} onChange={(e) => setCourseForm({ ...courseForm, credits: parseInt(e.target.value) })} className="mt-1" min="1" max="6" />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Students</label>
                  <Input type="number" value={courseForm.maxStudents} onChange={(e) => setCourseForm({ ...courseForm, maxStudents: parseInt(e.target.value) })} className="mt-1" min="10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} placeholder="Course description..." className="mt-1 w-full min-h-[80px] p-2 rounded-md border border-border bg-background" />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={editingCourse ? handleUpdateCourse : handleCreateCourse} className="flex-1">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
                <Button variant="outline" onClick={() => { setShowCourseDialog(false); setEditingCourse(null); resetCourseForm(); }}>Cancel</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Bulk Upload Dialog */}
        <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Bulk Upload Courses</DialogTitle>
              <DialogDescription>Upload CSV or Excel file with course data</DialogDescription>
            </DialogHeader>
            <BulkUpload
              entityType="courses"
              onImport={handleBulkImport}
              templateColumns={bulkUploadTemplate}
              sampleData={sampleBulkData}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ============ STUDENT VIEW ============
  if (isStudent) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Browse and enroll in courses</p>
          </div>
        </div>

        <Tabs defaultValue="enrolled" className="space-y-6 md:space-y-8">
          <TabsList className="w-full justify-start overflow-x-auto overflow-y-hidden flex-nowrap tabs-list-scroll">
            <TabsTrigger value="available">
              <Search className="w-4 h-4 mr-2" />
              Available Courses ({availableCourses.length})
            </TabsTrigger>
            <TabsTrigger value="enrolled">
              <GraduationCap className="w-4 h-4 mr-2" />
              My Courses ({enrolledCourses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="md:w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {departments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger className="md:w-36">
                  <SelectValue placeholder="Semester" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Semesters</SelectItem>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                 Array.from({length: 6}).map((_, i) => <CourseSkeleton key={i} />)
              ) : availableCourses.length > 0 ? (
                 availableCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={false}
                      image={getCourseImage(course.department, course.name)}
                      onView={(c) => { setSelectedCourse(c); fetchCourseSchedule(c.id); setShowDetailsDialog(true); }}
                      onEnroll={handleEnroll}
                    />
                 ))
              ) : (
                <EmptyState className="col-span-full" title="No courses found" description="Try changing department or semester filters." />
              )}
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                  Array.from({length: 3}).map((_, i) => <CourseSkeleton key={i} />)
              ) : enrolledCourses.length > 0 ? (
                  enrolledCourses.map((course) => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      enrolled={true}
                      image={getCourseImage(course.department, course.name)}
                      onView={(c) => { setSelectedCourse(c); fetchCourseSchedule(c.id); setShowDetailsDialog(true); }}
                      onDrop={handleDrop}
                    />
                  ))
              ) : (
                <EmptyState className="col-span-full" title="No enrolled courses" description="Browse available courses to enroll." />
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Student Course Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            {selectedCourse && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    {selectedCourse.code} - {selectedCourse.name}
                  </DialogTitle>
                  <DialogDescription>{selectedCourse.department}</DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Faculty</p>
                      <p className="font-medium">{selectedCourse.facultyName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Credits</p>
                      <p className="font-medium">{selectedCourse.credits}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Semester</p>
                      <p className="font-medium">{selectedCourse.semester}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Enrolled</p>
                      <p className="font-medium">{selectedCourse.enrolledStudents}/{selectedCourse.maxStudents}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p className="text-sm">{selectedCourse.description}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Schedule
                    </p>
                    {loadingSchedule ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading schedule...
                      </div>
                    ) : courseSchedule.length > 0 ? (
                      <div className="space-y-2">
                        {courseSchedule.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-4 text-sm p-2 bg-muted rounded">
                            <span className="font-medium w-24">{slot.day}</span>
                            <span className="text-muted-foreground">{slot.timeSlot}</span>
                            <span className="text-muted-foreground ml-auto flex items-center gap-1">
                              {slot.room}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No schedule has been set for this course yet.</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {isAdmin && (
                      <div className="flex gap-2 w-full">
                         <Button variant="outline" onClick={() => openEditDialog(selectedCourse)} className="flex-1">Edit Course</Button>
                         <Button variant="destructive" onClick={() => handleDeleteCourse(selectedCourse.id)} className="flex-1">Delete</Button>
                      </div>
                    )}
                    {!isAdmin && isStudent && (
                      !enrolledCourseIds.includes(selectedCourse.id) ? (
                        <Button
                          onClick={() => handleEnroll(selectedCourse)}
                          disabled={enrolling || selectedCourse.enrolledStudents >= selectedCourse.maxStudents}
                          className="flex-1"
                        >
                          {enrolling ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              Enrolling...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Enroll Now
                            </>
                          )}
                        </Button>
                      ) : (
                        <Button
                          variant="destructive"
                          onClick={() => {
                            handleDrop(selectedCourse.id);
                            setShowDetailsDialog(false);
                          }}
                          className="flex-1"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Drop Course
                        </Button>
                      )
                    )}
                    <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                      Close
                    </Button>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Fallback for other roles
  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-muted-foreground">Access denied</p>
    </div>
  );
}

function CourseCard({ 
  course, 
  enrolled, 
  image,
  onView, 
  onEnroll, 
  onDrop 
}: { 
  course: Course;
  enrolled: boolean;
  image: string;
  onView: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  onDrop?: (courseId: string) => void;
}) {
  const isFull = course.enrolledStudents >= course.maxStudents;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.18 }}
      className="card-elevated group overflow-hidden hover:shadow-xl transition-all duration-150"
    >
      <div className="h-40 w-full relative overflow-hidden bg-muted">
        <ImageWithBlur 
          src={image}
          alt={course.name}
          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent opacity-80" />
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end z-10">
          <Badge variant="outline" className="bg-background/90 backdrop-blur-md shadow-sm border-white/20">
             {course.code}
          </Badge>
          {enrolled ? (
            <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Enrolled
            </Badge>
          ) : isFull && (
            <Badge variant="destructive" className="shadow-lg">Full</Badge>
          )}
        </div>
      </div>
      
      <div className="ui-card-pad space-y-3">
        <div>
          <h3 className="font-semibold text-foreground text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">{course.name}</h3>
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-primary/70" />
            <span className="truncate">{course.facultyName}</span>
          </div>
          <div className="flex items-center gap-2">
            <GraduationCap className="w-3.5 h-3.5 text-primary/70" />
            {course.credits} Credits • Sem {course.semester}
          </div>
           <div className="flex items-center gap-2">
             <div className="w-3.5 h-3.5 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full ${course.enrolledStudents >= course.maxStudents ? 'bg-red-500' : 'bg-green-500'}`} />
             </div>
             {course.enrolledStudents} / {course.maxStudents} Students
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          {!enrolled && !isFull && (
             <Button 
              size="sm"
              onClick={() => onEnroll?.(course)}
              className="flex-1 shadow-sm"
              variant="default"
            >
              <Plus className="w-4 h-4 mr-2" /> Enroll
            </Button>
          )}
          
          <Button variant="outline" size="sm" onClick={() => onView(course)} className={enrolled || isFull ? "flex-1" : ""}>
             Details
          </Button>

          {enrolled && (
            <Button 
              size="sm"
              variant="destructive"
              className="px-3"
              onClick={() => onDrop?.(course.id)}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
