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
} from 'lucide-react';
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
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query,
  where,
  getDocs, 
  addDoc, 
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { exportCourseListPDF } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';

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
  const navigate = useNavigate();
  const { permissions, isAdmin, isFaculty, isStudent, user, role, loading: authLoading } = usePermissions();
  const { filterByDepartment, canManageItem } = useDepartmentFilter();
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

  const handleBulkImport = async (data: any[]) => {
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const row of data) {
      try {
        await addDoc(collection(db, 'courses'), {
          code: row.code,
          name: row.name,
          department: row.department,
          semester: parseInt(row.semester),
          credits: parseInt(row.credits),
          facultyName: row.facultyName || '',
          maxStudents: parseInt(row.maxStudents) || 60,
          description: row.description || '',
          enrolledStudents: 0,
          schedule: [],
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
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

  const exportCourses = () => {
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

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadData = async () => {
      try {
        await fetchCourses();

        // Fetch enrollments for students
        if (isStudent && user.uid) {
          const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('studentId', '==', user.uid),
            where('status', '==', 'active')
          );
          const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
          const enrolledIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
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
  }, [user, isStudent, navigate]);

  const fetchCourses = async () => {
    try {
      const coursesSnapshot = await getDocs(collection(db, 'courses'));
      let coursesData = coursesSnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Course[];
      
      // For faculty: filter by assignments first, then by department
      if (isFaculty && user?.uid) {
        // Check if faculty has assignments
        const assignmentsQuery = query(
          collection(db, 'facultyAssignments'),
          where('facultyId', '==', user.uid)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        
        if (assignmentsSnap.docs.length > 0) {
          // Faculty has assignments - show only assigned courses
          const assignedCourseIds = assignmentsSnap.docs.map(doc => doc.data().courseId);
          coursesData = coursesData.filter(course => assignedCourseIds.includes(course.id));
        } else {
          // No assignments - filter by department
          coursesData = filterByDepartment(coursesData);
        }
      } else if (!isAdmin) {
        // For non-admin, non-faculty: apply department filter
        coursesData = filterByDepartment(coursesData);
      }
      
      setCourses(coursesData);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const handleEditCourse = (course: Course) => {
    // Faculty can only edit courses in their department
    if (isFaculty && !canManageItem((course as any).department)) {
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
      await addDoc(collection(db, 'courses'), {
        ...courseForm,
        enrolledStudents: 0,
        schedule: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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
      await updateDoc(doc(db, 'courses', editingCourse.id), {
        ...courseForm,
        updatedAt: serverTimestamp(),
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
      await deleteDoc(doc(db, 'courses', courseId));
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

      await addDoc(collection(db, 'enrollments'), {
        studentId: user.uid,
        courseId: course.id,
        semester: course.semester,
        academicYear: '2024-25',
        enrolledAt: serverTimestamp(),
        status: 'active',
      });

      await updateDoc(doc(db, 'courses', course.id), {
        enrolledStudents: course.enrolledStudents + 1,
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
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', user.uid),
        where('courseId', '==', courseId),
        where('status', '==', 'active')
      );
      const enrollmentSnapshot = await getDocs(enrollmentsQuery);
      
      if (enrollmentSnapshot.empty) {
        toast.error('Enrollment not found');
        return;
      }

      const enrollmentDoc = enrollmentSnapshot.docs[0];
      await updateDoc(doc(db, 'enrollments', enrollmentDoc.id), {
        status: 'dropped',
      });

      const course = courses.find(c => c.id === courseId);
      if (course) {
        await updateDoc(doc(db, 'courses', courseId), {
          enrolledStudents: Math.max(0, course.enrolledStudents - 1),
        });
      }

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
    return matchesSearch && matchesDept && matchesSem;
  });

  const availableCourses = filteredCourses.filter(c => !enrolledCourseIds.includes(c.id));
  const enrolledCourses = courses.filter(c => enrolledCourseIds.includes(c.id));
  const departments = [...new Set(courses.map(c => c.department))];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  // ============ ADMIN/FACULTY VIEW ============
  if (isAdmin || isFaculty) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Course Management</h1>
            <p className="text-muted-foreground mt-1">Manage all courses in the system</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <PDFExportButton
              onExport={async () => {
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

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card-elevated p-5">
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
          <div className="card-elevated p-5">
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
          <div className="card-elevated p-5">
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
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No courses found</td></tr>
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Courses</h1>
            <p className="text-muted-foreground mt-1">Browse and enroll in courses</p>
          </div>
        </div>

        <Tabs defaultValue="available" className="space-y-6">
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
              {availableCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={false}
                  onView={(c) => { setSelectedCourse(c); setShowDetailsDialog(true); }}
                  onEnroll={handleEnroll}
                />
              ))}
              {availableCourses.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <BookOpen className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No courses found</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="enrolled" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {enrolledCourses.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrolled={true}
                  onView={(c) => { setSelectedCourse(c); setShowDetailsDialog(true); }}
                  onDrop={handleDrop}
                />
              ))}
              {enrolledCourses.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-20" />
                  <p>No enrolled courses</p>
                  <p className="text-sm mt-1">Browse available courses to enroll</p>
                </div>
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

                  {selectedCourse.schedule && selectedCourse.schedule.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Schedule</p>
                      <div className="space-y-2">
                        {selectedCourse.schedule.map((slot, idx) => (
                          <div key={idx} className="flex items-center gap-4 text-sm p-2 bg-muted rounded">
                            <span className="font-medium w-20">{slot.day}</span>
                            <span className="text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                            <span className="text-muted-foreground ml-auto">{slot.room}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    {!enrolledCourseIds.includes(selectedCourse.id) ? (
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
  onView, 
  onEnroll, 
  onDrop 
}: { 
  course: Course;
  enrolled: boolean;
  onView: (course: Course) => void;
  onEnroll?: (course: Course) => void;
  onDrop?: (courseId: string) => void;
}) {
  const isFull = course.enrolledStudents >= course.maxStudents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-elevated p-4 space-y-3"
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold text-foreground">{course.code}</h3>
          <p className="text-sm text-muted-foreground line-clamp-1">{course.name}</p>
        </div>
        {enrolled ? (
          <Badge variant="default" className="bg-success">
            <CheckCircle className="w-3 h-3 mr-1" />
            Enrolled
          </Badge>
        ) : isFull ? (
          <Badge variant="destructive">Full</Badge>
        ) : (
          <Badge variant="outline">{course.enrolledStudents}/{course.maxStudents}</Badge>
        )}
      </div>

      <div className="space-y-1 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <Users className="w-3.5 h-3.5" />
          {course.facultyName}
        </div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-3.5 h-3.5" />
          {course.credits} Credits • Semester {course.semester}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button variant="outline" size="sm" onClick={() => onView(course)} className="flex-1">
          View Details
        </Button>
        {enrolled ? (
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDrop?.(course.id)}
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button 
            size="sm"
            onClick={() => onEnroll?.(course)}
            disabled={isFull}
          >
            <Plus className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}
