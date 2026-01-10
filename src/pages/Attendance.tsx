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
import { onAuthStateChanged } from 'firebase/auth';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  serverTimestamp,
  orderBy,
  Timestamp
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useDepartmentFilter } from '@/hooks/useDepartmentFilter';
import BulkUpload from '@/components/BulkUpload';
import * as XLSX from 'xlsx';
import { exportAttendanceReport } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';

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

export default function Attendance() {
  const navigate = useNavigate();
  const { isAdmin, isFaculty, isStudent, user, loading: authLoading } = usePermissions();
  const { filterByDepartment } = useDepartmentFilter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/auth');
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin || isFaculty) {
    return <AttendanceManager userId={user.uid} userRole={user.role} />;
  }

  return <StudentAttendanceView userId={user.uid} />;
}

function AttendanceManager({ userId, userRole }: { userId: string; userRole: string }) {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]); // { id, name, status, recordId }
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = userRole === 'college_admin' || userRole === 'super_admin';

  useEffect(() => {
    fetchCourses();
  }, [userId, userRole]);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudentAttendance();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      let q = query(collection(db, 'courses'));
      const snapshot = await getDocs(q);
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for faculty using assignments
      if (!isAdmin && userId) {
        const assignmentsQuery = query(
          collection(db, 'facultyAssignments'),
          where('facultyId', '==', userId)
        );
        const assignmentsSnap = await getDocs(assignmentsQuery);
        
        if (assignmentsSnap.docs.length > 0) {
          // Faculty has assignments - show only assigned courses
          const assignedCourseIds = assignmentsSnap.docs.map(doc => doc.data().courseId);
          data = data.filter(course => assignedCourseIds.includes(course.id));
        } else {
          // No assignments - filter by department
          // Get user department
          const userDoc = await getDoc(doc(db, 'users', userId));
          const userDept = userDoc.data()?.department;
          if (userDept) {
            data = data.filter(course => (course as any).department === userDept);
          }
        }
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
      // 1. Fetch Students enrolled in the course
      const enrollmentsQ = query(collection(db, 'enrollments'), where('courseId', '==', selectedCourse), where('status', '==', 'active'));
      const enrollmentsSnap = await getDocs(enrollmentsQ);
      
      const enrolledStudents = enrollmentsSnap.docs.map(d => ({
        studentId: d.data().studentId,
        enrollmentId: d.id
      }));

      // 2. Fetch User Details
      const studentData = await Promise.all(
        enrolledStudents.map(async (en) => {
          const userDoc = await getDoc(doc(db, 'users', en.studentId));
          return {
            id: en.studentId,
            name: userDoc.data()?.fullName || 'Unknown',
            email: userDoc.data()?.email || '',
            enrollmentId: en.enrollmentId
          };
        })
      );

      // 3. Fetch Existing Attendance
      const startOfDay = new Date(selectedDate);
      startOfDay.setHours(0,0,0,0);
      const endOfDay = new Date(selectedDate);
      endOfDay.setHours(23,59,59,999);

      // Simple query to avoid composite index requirement while building
      const attendanceQ = query(
        collection(db, 'attendance'),
        where('courseId', '==', selectedCourse)
      );
      const attendanceSnap = await getDocs(attendanceQ);
      
      const existingRecords = attendanceSnap.docs.reduce((acc: any, doc) => {
        const data = doc.data();
        const recordDate = data.date?.toDate?.() || new Date(data.date);
        if (recordDate >= startOfDay && recordDate <= endOfDay) {
          acc[data.studentId] = { id: doc.id, ...data };
        }
        return acc;
      }, {});

      // 4. Merge
      const merged = studentData.map(student => ({
        ...student,
        recordId: existingRecords[student.id]?.id,
        status: existingRecords[student.id]?.status || null // null means not marked
      }));

      setStudents(merged);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error('Failed to load student list');
    }
 finally {
      setLoading(false);
    }
  };

  const handleMark = (studentId: string, status: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status } : s));
  };

  const handleSave = async () => {
    try {
      const batchPromises = students.map(async (student) => {
        if (!student.status) return; // Skip unmarked

        const data = {
          studentId: student.id,
          courseId: selectedCourse,
          date: Timestamp.fromDate(new Date(selectedDate)),
          status: student.status,
          markedBy: userId,
          markedAt: serverTimestamp()
        };

        if (student.recordId) {
           await updateDoc(doc(db, 'attendance', student.recordId), data);
        } else {
           await addDoc(collection(db, 'attendance'), data);
        }
      });
      await Promise.all(batchPromises);
      toast.success('Attendance saved successfully');
      fetchStudentAttendance(); // Refresh
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

    for (const row of data) {
      try {
        // Find Course
        const course = courses.find(c => c.code === row.courseCode);
        if (!course) throw new Error(`Course ${row.courseCode} not found`);

        // Find Student
        const usersQ = query(collection(db, 'users'), where('email', '==', row.studentEmail));
        const usersSnap = await getDocs(usersQ);
        if (usersSnap.empty) throw new Error(`Student ${row.studentEmail} not found`);
        const studentId = usersSnap.docs[0].id;

        // Date
        const dateObj = new Date(row.date);
        if (isNaN(dateObj.getTime())) throw new Error(`Invalid date ${row.date}`);

        // Status
        const status = row.status?.toLowerCase();
        if (!['present', 'absent', 'late'].includes(status)) throw new Error(`Invalid status ${status}`);

        // Check Existing
        const start = new Date(dateObj); start.setHours(0,0,0,0);
        const end = new Date(dateObj); end.setHours(23,59,59,999);
        const attQ = query(collection(db, 'attendance'), 
           where('studentId', '==', studentId), 
           where('courseId', '==', course.id),
           where('date', '>=', Timestamp.fromDate(start)),
           where('date', '<=', Timestamp.fromDate(end))
        );
        const attSnap = await getDocs(attQ);

        const recordData = {
           studentId,
           courseId: course.id,
           date: Timestamp.fromDate(dateObj),
           status,
           markedBy: userId,
           markedAt: serverTimestamp()
        };

        if (!attSnap.empty) {
           await updateDoc(doc(db, 'attendance', attSnap.docs[0].id), recordData);
        } else {
           await addDoc(collection(db, 'attendance'), recordData);
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Attendance Manager</h1>
          <p className="text-muted-foreground">Mark and manage class attendance</p>
        </div>
        <div className="flex gap-2">
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

      <div className="card-elevated p-6 space-y-4">
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
                         <tr><td colSpan={2} className="p-4 text-center text-muted-foreground">No students enrolled</td></tr>
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
      const recordsQ = query(collection(db, 'attendance'), where('studentId', '==', userId));
      const recordsSnap = await getDocs(recordsQ);
      const records = recordsSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any[];
      setAttendanceRecords(records);

      const enrollQ = query(collection(db, 'enrollments'), where('studentId', '==', userId), where('status', '==', 'active'));
      const enrollSnap = await getDocs(enrollQ);
      
      const courseStats: CourseAttendance[] = [];
      let totalPresent = 0;
      let totalClasses = 0;

      for (const d of enrollSnap.docs) {
        const en = d.data();
        const courseDoc = await getDoc(doc(db, 'courses', en.courseId));
        const courseData = courseDoc.data();
        
        const cRecords = records.filter(r => r.courseId === en.courseId);
        const present = cRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const absent = cRecords.filter(r => r.status === 'absent').length;
        const late = cRecords.filter(r => r.status === 'late').length;
        const total = cRecords.length;
        const percentage = total > 0 ? Math.round((present / total) * 100) : 0;

        courseStats.push({
          courseId: en.courseId,
          courseName: courseData?.name || 'Unknown',
          courseCode: courseData?.code || 'N/A',
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
    if (selectedCourse !== 'all' && record.courseId !== selectedCourse) return false;
    if (selectedMonth !== 'all') {
      const d = record.date?.toDate?.() || new Date(record.date);
      if (d.getMonth() !== parseInt(selectedMonth)) return false;
    }
    return true;
  });

  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Attendance</h1>
        <p className="text-muted-foreground">Track your attendance metrics</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card-elevated p-6">
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

      <div className="grid gap-4 md:grid-cols-2">
         {courseAttendance.map(c => (
           <div key={c.courseId} className="card-elevated p-4">
             <div className="flex justify-between mb-2">
               <div><p className="font-medium">{c.courseCode}</p><p className="text-xs text-muted-foreground">{c.courseName}</p></div>
               <span className={`font-bold ${getStatusColor(c.percentage)}`}>{c.percentage}%</span>
             </div>
             <Progress value={c.percentage} className={`h-2 ${getProgressColor(c.percentage)}`} />
             <div className="mt-2 text-xs text-muted-foreground flex justify-between">
                <span>{c.present} present, {c.absent} absent</span>
                <span>{c.total} classes</span>
             </div>
           </div>
         ))}
      </div>

       {/* Simplified Log View */}
      <div className="card-elevated p-6">
        <div className="flex justify-between items-center mb-4">
           <h2 className="font-semibold">Attendance Log</h2>
           <Select value={selectedCourse} onValueChange={setSelectedCourse}><SelectTrigger className="w-40"><SelectValue placeholder="All" /></SelectTrigger><SelectContent><SelectItem value="all">All</SelectItem>{courseAttendance.map(c=><SelectItem key={c.courseId} value={c.courseId}>{c.courseCode}</SelectItem>)}</SelectContent></Select>
        </div>
        <div className="space-y-2">
           {filteredRecords.length === 0 ? <p className="text-center text-muted-foreground py-4">No records found</p> : 
             filteredRecords.sort((a,b)=>(b.date?.seconds||0) - (a.date?.seconds||0)).map(r => (
               <div key={r.id} className="flex justify-between items-center p-3 border rounded">
                 <div className="flex gap-3 items-center">
                   {r.status==='present'?<CheckCircle className="text-success w-5 h-5"/>:r.status==='late'?<Clock className="text-warning w-5 h-5"/>:<XCircle className="text-destructive w-5 h-5"/>}
                   <div>
                     <p className="font-medium text-sm">{courseAttendance.find(c=>c.courseId===r.courseId)?.courseCode || 'Unknown'}</p>
                     <p className="text-xs text-muted-foreground">{r.date?.toDate?.().toLocaleDateString()}</p>
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
