"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Users,
  Save,
  Upload,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { usePermissions } from '@/hooks/usePermissions';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { exportAttendanceReport } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import api from '@/lib/api';

interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: any;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
  markedAt: any;
}

interface CourseAttendance {
  courseId: string;
  courseName: string;
  courseCode: string;
  present: number;
  absent: number;
  late: number;
  total: number;
  percentage: number;
}

type ApiResponse<T> = { success: boolean; data: T; meta?: any };

const extractData = <T,>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return response?.data as T;
};

const parseDateValue = (value: any): Date => {
  if (!value) return new Date(NaN);
  if (value?.toDate) return value.toDate();
  return new Date(value);
};

export default function Attendance() {
  const router = useRouter();
  const { isAdmin, isFaculty, isStudent, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      router.replace('/auth');
      return;
    }
    setLoading(false);
  }, [authLoading, user, router]);

  if (loading) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div className="h-8 w-56 bg-muted rounded-md animate-pulse" />
        <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-28 rounded-md" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return (
      <AttendanceManager
        userId={user.uid}
        userRole={user.role}
        userName={user.fullName || user.name || ''}
      />
    );
  }

  return <StudentAttendanceView userId={user.uid} />;
}

function AttendanceManager({
  userId,
  userRole,
  userName,
}: {
  userId: string;
  userRole: string;
  userName: string;
}) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]); // { id, name, status, recordId }
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = userRole === 'admin';

  useEffect(() => {
    fetchCourses();
  }, [userId, userRole, userName]);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudentAttendance();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get<ApiResponse<any[]>>('/courses', {
        params: { limit: 200, offset: 0 },
      });
      let data = extractData<any[]>(response) || [];
      
      if (!isAdmin && userId) {
        const normalizedUserName = (userName || '').trim().toLowerCase();
        data = data.filter((course: any) => {
          const instructorValue = String(course?.instructor || '')
            .trim()
            .toLowerCase();
          return (
            course?.facultyId === userId ||
            course?.instructor === userId ||
            (normalizedUserName.length > 0 && instructorValue === normalizedUserName)
          );
        });
      }
      
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast.error('Failed to load courses');
    }
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const selectedCourseData = courses.find((course: any) => course.id === selectedCourse);
      const selectedCourseSubject = selectedCourseData?.code || selectedCourse;

      const enrollmentsResponse = await api.get<ApiResponse<any[]>>('/enrollments', {
        params: { courseId: selectedCourse, status: 'active', limit: 200, offset: 0 },
      });
      const enrolledStudents = (extractData<any[]>(enrollmentsResponse) || []).map((item) => ({
        studentId: item.studentId,
        enrollmentId: item.id,
        studentName: item.student?.name || '',
        studentEmail: item.student?.email || '',
      }));

      const usersResponse = await api.get<ApiResponse<any[]>>('/users', {
        params: { role: 'student', limit: 200, offset: 0 },
      });
      const users = extractData<any[]>(usersResponse) || [];
      const usersById = new Map(users.map((u: any) => [u.id, u]));

      const studentData = await Promise.all(
        enrolledStudents.map(async (en) => {
          const userDoc = usersById.get(en.studentId);
          return {
            id: en.studentId,
            name:
              en.studentName ||
              userDoc?.fullName ||
              userDoc?.name ||
              `Student ${String(en.studentId).slice(-6)}`,
            email: en.studentEmail || userDoc?.email || '',
            enrollmentId: en.enrollmentId
          };
        })
      );

      const attendanceResponse = await api.get<ApiResponse<any[]>>('/attendance', {
        params: { subject: selectedCourseSubject, date: selectedDate, limit: 200, offset: 0 },
      });
      const attendanceRows = extractData<any[]>(attendanceResponse) || [];
      const existingRecords = attendanceRows.reduce((acc: any, record: any) => {
        acc[record.studentId] = record;
        return acc;
      }, {});

      const merged = studentData.map(student => ({
        ...student,
        recordId: existingRecords[student.id]?.id,
        status: existingRecords[student.id]?.status || null // null means not marked
      }));

      setStudents(merged);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student list');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleSave = async () => {
    try {
      const selectedCourseData = courses.find((course: any) => course.id === selectedCourse);
      const selectedCourseSubject = selectedCourseData?.code || selectedCourse;

      const batchPromises = students.map(async (student) => {
        if (!student.status) return; // Skip unmarked

        const data = {
          studentId: student.id,
          subject: selectedCourseSubject,
          date: selectedDate,
          status: student.status,
        };

        if (student.recordId) {
           await api.patch(`/attendance/${student.recordId}`, {
            date: selectedDate,
            status: student.status,
            subject: selectedCourseSubject,
           });
        } else {
           await api.post('/attendance', data);
        }
      });
      await Promise.all(batchPromises);
      toast.success('Attendance saved successfully');
      fetchStudentAttendance();
    } catch (error) {
      console.error('Error saving attendance:', error);
      toast.error('Failed to save attendance');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    // data: { studentEmail, courseCode, date, status }
    let success = 0;
    let failed = 0;
    const errors: string[] = [];

     const usersResponse = await api.get<ApiResponse<any[]>>('/users', {
      params: { role: 'student', limit: 200, offset: 0 },
     });
     const users = extractData<any[]>(usersResponse) || [];

    for (const row of data) {
      try {
        const course = courses.find(c => c.code === row.courseCode);
        if (!course) throw new Error(`Course ${row.courseCode} not found`);

        const student = users.find((u: any) => u.email?.toLowerCase() === row.studentEmail?.toLowerCase());
        if (!student) throw new Error(`Student ${row.studentEmail} not found`);
        const studentId = student.id;

        const dateObj = new Date(row.date);
        if (isNaN(dateObj.getTime())) throw new Error(`Invalid date ${row.date}`);

        const status = row.status?.toLowerCase();
        if (!['present', 'absent', 'late'].includes(status)) throw new Error(`Invalid status ${status}`);

        const normalizedDate = dateObj.toISOString().split('T')[0];

        const attResponse = await api.get<ApiResponse<any[]>>('/attendance', {
         params: {
          studentId,
          subject: course.code,
          date: normalizedDate,
          limit: 1,
          offset: 0,
         }
        });
        const existingAttendance = extractData<any[]>(attResponse) || [];

        const recordData = {
           studentId,
          subject: course.code,
          date: normalizedDate,
           status,
        };

        if (existingAttendance.length > 0) {
          await api.patch(`/attendance/${existingAttendance[0].id}`, {
          status,
          subject: course.code,
          date: normalizedDate,
          });
        } else {
          await api.post('/attendance', recordData);
        }
        success++;
      } catch (err) {
        failed++;
        errors.push((err as Error).message);
      }
    }
    
    if (selectedCourse) fetchStudentAttendance();
    return { success, failed, errors };
  };

  const bulkTemplate = ['studentEmail', 'courseCode', 'date', 'status'];
  const sampleData = [{ studentEmail: 'student@example.com', courseCode: 'CS101', date: '2024-01-01', status: 'present' }];

  return (
    <div className="space-y-6 md:space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Manager</h1>
          <p className="text-muted-foreground">Mark and manage class attendance</p>
        </div>
        <div className="button-group">
           <PDFExportButton
             onExport={async () => {
               if (!selectedCourse) {
                 toast.error('Please select a course first');
                 return;
               }
               const course = courses.find(c => c.id === selectedCourse);
               const attendanceData = students.map(s => ({
                 studentName: s.name,
                 enrollmentNumber: s.email,
                 present: s.status === 'present' ? 1 : 0,
                 absent: s.status === 'absent' ? 1 : 0,
                 total: s.status ? 1 : 0,
                 percentage: s.status === 'present' ? 100 : s.status === 'absent' ? 0 : 50
               }));
               exportAttendanceReport(
                 course?.name || 'Course',
                 attendanceData,
                 { start: selectedDate, end: selectedDate }
               );
             }}
             label="Export PDF"
           />
           <Button variant="outline" onClick={() => setShowBulkUpload(true)}>
             <Upload className="w-4 h-4 mr-2" /> Bulk Upload
           </Button>
        </div>
      </div>

      <div className="card-elevated ui-card-pad space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Select Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Date</label>
            <Input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
          </div>
        </div>

        {selectedCourse && (
          <div className="mt-6">
             {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : (
               <>
                 <div className="rounded-md border border-border overflow-hidden">
                   <table className="w-full">
                     <thead className="bg-muted/30">
                       <tr>
                         <th className="p-3 text-left font-medium text-sm">Student</th>
                         <th className="p-3 text-center font-medium text-sm">Status</th>
                       </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                       {students.length === 0 ? (
                        <tr>
                          <td colSpan={2} className="p-4">
                            <EmptyState
                              title="No students enrolled"
                              description="Enroll students in this course to mark attendance."
                            />
                          </td>
                        </tr>
                       ) : (
                         students.map(student => (
                           <tr key={student.id} className="hover:bg-muted/10">
                             <td className="p-3">
                               <p className="font-medium text-foreground">{student.name}</p>
                               <p className="text-xs text-muted-foreground">{student.email}</p>
                             </td>
                             <td className="p-3 text-center">
                               <div className="flex justify-center gap-2">
                                 <Button 
                                   size="sm" 
                                   variant={student.status === 'present' ? 'default' : 'outline'}
                                   className={student.status === 'present' ? 'bg-success hover:bg-success/90' : ''}
                                   onClick={() => handleMark(student.id, 'present')}
                                 >
                                   P
                                 </Button>
                                 <Button 
                                   size="sm" 
                                   variant={student.status === 'absent' ? 'default' : 'outline'}
                                   className={student.status === 'absent' ? 'bg-destructive hover:bg-destructive/90' : ''}
                                   onClick={() => handleMark(student.id, 'absent')}
                                 >
                                   A
                                 </Button>
                                 <Button 
                                   size="sm" 
                                   variant={student.status === 'late' ? 'default' : 'outline'}
                                   className={student.status === 'late' ? 'bg-warning hover:bg-warning/90' : ''}
                                   onClick={() => handleMark(student.id, 'late')}
                                 >
                                   L
                                 </Button>
                               </div>
                             </td>
                           </tr>
                         ))
                       )}
                     </tbody>
                   </table>
                 </div>
                 <div className="flex justify-end mt-4">
                   <Button onClick={handleSave}>
                     <Save className="w-4 h-4 mr-2" /> Save Attendance
                   </Button>
                 </div>
               </>
             )}
          </div>
        )}
      </div>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
           <DialogHeader>
             <DialogTitle>Bulk Upload Attendance</DialogTitle>
             <DialogDescription>Columns: studentEmail, courseCode, date (YYYY-MM-DD), status (present/absent/late)</DialogDescription>
           </DialogHeader>
           <BulkUpload 
             entityType="attendance" 
             onImport={handleBulkImport} 
             templateColumns={bulkTemplate} 
             sampleData={sampleData} 
           />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentAttendanceView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>([]);
  const [overallPercentage, setOverallPercentage] = useState(0);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const recordsResponse = await api.get<ApiResponse<any[]>>('/attendance', {
        params: { studentId: userId, limit: 200, offset: 0 },
      });
      const records = extractData<any[]>(recordsResponse) || [];
      setAttendanceRecords(records);

      const enrollmentsResponse = await api.get<ApiResponse<any[]>>('/enrollments', {
        params: { studentId: userId, status: 'active', limit: 200, offset: 0 },
      });
      const enrollments = extractData<any[]>(enrollmentsResponse) || [];

      const coursesResponse = await api.get<ApiResponse<any[]>>('/courses', {
        params: { limit: 200, offset: 0 },
      });
      const courses = extractData<any[]>(coursesResponse) || [];
      const coursesById = new Map(courses.map((course: any) => [course.id, course]));
      const courseCodeById = new Map(
        courses.map((course: any) => [course.id, course.code]),
      );
      
      const courseStats: CourseAttendance[] = [];
      let totalPresent = 0;
      let totalClasses = 0;

      for (const en of enrollments) {
        const courseData = coursesById.get(en.courseId);
        const enrolledCourseCode = en.courseCode || en.course?.code;
        const enrolledCourseName = en.courseName || en.course?.name;
        const courseCode = enrolledCourseCode || courseCodeById.get(en.courseId);
        const courseName = enrolledCourseName || courseData?.name || 'Unknown';
        
        const cRecords = records.filter(
          (r) =>
            r.subject === en.courseId ||
            (courseCode && r.subject === courseCode) ||
            (enrolledCourseCode && r.subject === enrolledCourseCode),
        );
        const present = cRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const absent = cRecords.filter(r => r.status === 'absent').length;
        const late = cRecords.filter(r => r.status === 'late').length;
        const total = cRecords.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        courseStats.push({
          courseId: en.courseId,
          courseName,
          courseCode: courseCode || 'N/A',
          present, absent, late, total, percentage
        });
        totalPresent += present;
        totalClasses += total;
      }
      setCourseAttendance(courseStats);
      setOverallPercentage(totalClasses > 0 ? Math.round((totalPresent / totalClasses) * 100) : 0);
    } catch (e) {
      console.error(e);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 65) return 'text-warning';
    return 'text-destructive';
  };
  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 65) return 'bg-warning';
    return 'bg-destructive';
  };

  const filteredRecords = attendanceRecords.filter(record => {
    if (selectedCourse !== 'all') {
      const selectedCourseData = courseAttendance.find((c) => c.courseId === selectedCourse);
      const selectedCourseCode = selectedCourseData?.courseCode;
      if (record.subject !== selectedCourse && record.subject !== selectedCourseCode) {
        return false;
      }
    }
    if (selectedMonth !== 'all') {
      const d = parseDateValue(record.date);
      if (d.getMonth() !== parseInt(selectedMonth)) return false;
    }
    return true;
  });

  if (loading) {
    return <LoadingGrid count={4} className="grid gap-4 md:grid-cols-2" itemClassName="h-28 rounded-md" />;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance metrics</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="card-elevated ui-card-pad">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Overall Attendance</h2>
          {overallPercentage < 75 && (
            <Badge variant="destructive" className="gap-1"><AlertTriangle className="w-3 h-3" /> Below 75%</Badge>
          )}
        </div>
        <div className="flex items-center gap-6">
           <div className="relative w-32 h-32">
             <svg className="w-full h-full -rotate-90">
               <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" className="text-muted" />
               <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="8" fill="none" 
                 strokeDasharray={`${2 * Math.PI * 56}`} 
                 strokeDashoffset={`${2 * Math.PI * 56 * (1 - overallPercentage / 100)}`} 
                 className={getStatusColor(overallPercentage)} strokeLinecap="round" />
             </svg>
             <div className="absolute inset-0 flex items-center justify-center">
               <span className={`text-3xl font-bold ${getStatusColor(overallPercentage)}`}>{overallPercentage}%</span>
             </div>
           </div>
           <div className="grid grid-cols-2 gap-4 text-sm">
             <div><p className="text-muted-foreground">Attended</p><p className="text-xl font-bold text-success">{courseAttendance.reduce((s,c)=>s+c.present,0)}</p></div>
             <div><p className="text-muted-foreground">Missed</p><p className="text-xl font-bold text-destructive">{courseAttendance.reduce((s,c)=>s+c.absent,0)}</p></div>
           </div>
        </div>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
         {courseAttendance.length === 0 ? (
           <EmptyState title="No course attendance yet" description="Attendance by course will appear once records are marked." className="md:col-span-2 xl:col-span-3" />
         ) : courseAttendance.map(c => (
           <div key={c.courseId} className="card-elevated p-4">
             <div className="flex justify-between mb-2">
               <div><p className="font-medium">{c.courseCode}</p><p className="text-xs text-muted-foreground">{c.courseName}</p></div>
               <span className={`font-bold ${getStatusColor(c.percentage)}`}>{c.percentage}%</span>
             </div>
             <div className="h-2 w-full overflow-hidden rounded-full bg-muted flex">
               <div
                 className="h-full bg-success"
                 style={{ width: `${c.total > 0 ? (c.present / c.total) * 100 : 0}%` }}
               />
               <div
                 className="h-full bg-destructive"
                 style={{ width: `${c.total > 0 ? (c.absent / c.total) * 100 : 0}%` }}
               />
             </div>
             <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <span>
                  <span className="text-success">{c.present} present</span>,{' '}
                  <span className="text-destructive">{c.absent} absent</span>
                </span>
                <span>{c.total} classes</span>
             </div>
           </div>
        ))}
      </div>

       {/* Simplified Log View */}
      <div className="card-elevated ui-card-pad">
        <div className="flex justify-between items-center mb-4">
           <h2 className="font-semibold">Attendance Log</h2>
           <Select value={selectedCourse} onValueChange={setSelectedCourse}><SelectTrigger className="w-40"><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{courseAttendance.map(c=><SelectItem key={c.courseId} value={c.courseId}>{c.courseCode}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-2">
           {filteredRecords.length === 0 ? <EmptyState title="No records found" description="Try another course filter." /> : 
             filteredRecords
               .sort((a,b) => parseDateValue(b.date).getTime() - parseDateValue(a.date).getTime())
               .map(r => (
               <div key={r.id} className="flex justify-between items-center p-3 border rounded">
                 <div className="flex gap-3 items-center">
                   {r.status==='present'?<CheckCircle className="text-success w-5 h-5"/>:r.status==='late'?<Clock className="text-warning w-5 h-5"/>:<XCircle className="text-destructive w-5 h-5"/>}
                   <div>
                     <p className="font-medium text-sm">
                       {courseAttendance.find(
                         (c) => c.courseId === r.subject || c.courseCode === r.subject,
                       )?.courseCode || 'Unknown'}
                     </p>
                     <p className="text-xs text-muted-foreground">{parseDateValue(r.date).toLocaleDateString()}</p>
                   </div>
                 </div>
                 <Badge variant={r.status==='present'?'default':r.status==='late'?'secondary':'destructive'}>{r.status}</Badge>
               </div>
             ))
           }
        </div>
      </div>
    </div>
  );
}
