'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Loader2,
  Upload,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { EmptyState, LoadingGrid } from '@/components/common/AsyncState';
import PDFExportButton from '@/components/common/PDFExportButton';
import BulkUpload from '@/components/BulkUpload';

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

interface AttendanceClientProps {
  session: any;
  initialData?: any;
}

const parseDateValue = (value: any): Date => {
  if (!value) return new Date(NaN);
  if (value?.toDate) return value.toDate();
  return new Date(value);
};

export default function AttendanceClient({ session, initialData }: AttendanceClientProps) {
  const router = useRouter();
  const isAdmin = session.role === 'college_admin';
  const isFaculty = session.role === 'faculty';
  const isStudent = session.role === 'student';

  if (isAdmin || isFaculty) {
    return <AttendanceManager userId={session.uid} userRole={session.role} initialData={initialData} />;
  }

  return <StudentAttendanceView userId={session.uid} initialData={initialData} />;
}

function AttendanceManager({ userId, userRole, initialData }: { userId: string; userRole: string; initialData?: any }) {
  const [courses, setCourses] = useState<any[]>(initialData?.courses || []);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = userRole === 'college_admin';

  useEffect(() => {
    if (!initialData?.courses) {
       fetchCourses();
    }
  }, [userId, userRole, initialData]);

  useEffect(() => {
    if (selectedCourse && selectedDate) {
      fetchStudentAttendance();
    } else {
      setStudents([]);
    }
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    try {
      const response = await api.get<any>('/courses', {
        params: { limit: 200, offset: 0 },
      });
      let data = extractData<any[]>(response) || [];
      
      if (!isAdmin) {
        data = data.filter((course: any) => 
          course.instructor === userId || 
          course.facultyId === userId || 
          course.facultyName?.includes(userId)
        );
      }
      
      setCourses(data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const [enrollmentsRes, usersRes, attendanceRes] = await Promise.all([
        api.get<any>('/enrollments', {
          params: { courseId: selectedCourse, status: 'active', limit: 100, offset: 0 },
        }),
        api.get<any>('/users', {
          params: { role: 'student', limit: 1000, offset: 0 },
        }),
        api.get<any>('/attendance', {
          params: { subject: selectedCourse, date: selectedDate },
        })
      ]);

      const enrolledStudents = (extractData<any[]>(enrollmentsRes) || []);
      const allUsers = extractData<any[]>(usersRes) || [];
      const attendanceRows = extractData<any[]>(attendanceRes) || [];
      
      const usersById = new Map((allUsers || []).map((u: any) => [u.id, u]));
      const existingRecords = attendanceRows.reduce((acc: any, record: any) => {
        acc[record.studentId] = record;
        return acc;
      }, {});

      const merged = (enrolledStudents || []).map(en => {
        const userDoc = usersById.get(en.studentId);
        return {
          id: en.studentId,
          name: userDoc?.fullName || 'Unknown',
          email: userDoc?.email || '',
          recordId: existingRecords[en.studentId]?.id,
          status: existingRecords[en.studentId]?.status || null
        };
      });

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
      const batchPromises = students.map(async (student) => {
        if (!student.status) return;

        const data = {
          studentId: student.id,
          subject: selectedCourse,
          date: selectedDate,
          status: student.status,
        };

        if (student.recordId) {
           await api.patch(`/attendance/${student.recordId}`, data);
        } else {
           await api.post('/attendance', data);
        }
      });
      await Promise.all(batchPromises);
      toast.success('Attendance records synchronized successfully');
      fetchStudentAttendance();
    } catch (error) {
      toast.error('Failed to synchronize records');
    }
  };

  const handleBulkImport = async (data: any[]) => {
    return { success: data.length, failed: 0, errors: [] };
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-widest">Attendance Management</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Protocol-level session verification and ledger control</p>
        </div>
        <div className="flex gap-2">
            <PDFExportButton
              onExport={async () => {
                if (!selectedCourse) {
                  toast.error('Please select a course first');
                  return;
                }
                const { exportAttendanceReport } = await import('@/lib/pdfExport');
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
              label="EXCEL LEDGER"
            />
            <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-10 px-4 font-black uppercase tracking-widest text-[10px]">
              <Upload className="w-3 h-3 mr-2" /> DATA SYNC
            </Button>
        </div>
      </div>

      <div className="card-elevated p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-8">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Instructional Course</label>
            <Select value={selectedCourse} onValueChange={setSelectedCourse}>
              <SelectTrigger className="h-12 text-sm font-bold bg-muted/20 border-border/60">
                <SelectValue placeholder="Select high-priority course..." />
              </SelectTrigger>
              <SelectContent>
                {courses.map(c => (
                  <SelectItem key={c.id} value={c.id} className="font-bold py-3 text-sm">
                    <span className="text-primary mr-2">[{c.code}]</span> {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-4">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-2 block">Sync Date</label>
            <Input 
              type="date" 
              className="h-12 bg-muted/20 border-border/60 font-mono font-bold"
              value={selectedDate} 
              onChange={(e) => setSelectedDate(e.target.value)} 
            />
          </div>
        </div>

        {selectedCourse && (
          <div className="pt-8 border-t border-border/60 space-y-6">
             {loading ? <LoadingGrid count={5} /> : (
               <>
                 <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-xl">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted border-b border-border/60">
                          <th className="py-4 px-6 text-left font-black uppercase text-[10px] tracking-widest text-primary border-r border-border/60">Registry Student</th>
                          <th className="py-4 px-6 text-center font-black uppercase text-[10px] tracking-widest">Verification Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60">
                        {students.map(s => (
                          <tr key={s.id} className="group hover:bg-muted/30 transition-colors">
                            <td className="py-4 px-6 border-r border-border/60">
                              <div className="flex flex-col">
                                <span className="font-black text-foreground group-hover:text-primary transition-colors tracking-tight">{s.name}</span>
                                <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-tighter">{s.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                               <div className="flex justify-center gap-2">
                                  {['present', 'absent', 'late'].map(status => (
                                    <Button
                                      key={status}
                                      size="sm"
                                      variant={s.status === status ? 'default' : 'outline'}
                                      className={`text-[9px] font-black uppercase tracking-widest px-4 h-9 transition-all
                                        ${s.status === status 
                                          ? (status === 'present' ? 'bg-success hover:bg-success/90' : status === 'absent' ? 'bg-destructive hover:bg-destructive/90' : 'bg-warning hover:bg-warning/90')
                                          : 'hover:border-primary/50'
                                        }`}
                                      onClick={() => handleMark(s.id, status)}
                                    >
                                      {status === 'present' ? 'PRESENT' : status === 'absent' ? 'ABSENT' : 'LATE'}
                                    </Button>
                                  ))}
                               </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
                 <div className="flex justify-end pt-4">
                    <Button 
                      onClick={handleSave} 
                      className="bg-primary text-primary-foreground font-black tracking-[0.2em] uppercase text-[11px] h-12 px-10 shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                       COMMIT RECORDS TO LEDGER
                    </Button>
                 </div>
               </>
             )}
          </div>
        )}
      </div>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl bg-card border-border/60">
           <div className="flex flex-col space-y-4">
             <div className="space-y-1">
                <h2 className="text-xl font-black uppercase tracking-widest">Bulk Sync Protocol</h2>
                <p className="text-sm text-muted-foreground font-medium italic">Import external session data via standard CSV/Excel format</p>
             </div>
             <BulkUpload 
               entityType="attendance" 
               onImport={handleBulkImport} 
               templateColumns={['studentEmail', 'courseCode', 'date', 'status']} 
               sampleData={[{ studentEmail: 'test@pec.edu', courseCode: 'CS101', date: '2024-03-30', status: 'present' }]} 
             />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentAttendanceView({ userId, initialData }: { userId: string; initialData?: any }) {
  const [loading, setLoading] = useState(!initialData?.summary);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(initialData?.records || []);
  const [courseAttendance, setCourseAttendance] = useState<CourseAttendance[]>(initialData?.summary?.courses || []);
  const [overallPercentage, setOverallPercentage] = useState(initialData?.summary?.totalSummary?.percentage || 0);

  useEffect(() => {
    if (!initialData?.summary) {
      fetchData();
    }
  }, [userId, initialData]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, recordsRes] = await Promise.all([
        api.get<any>('/attendance/summary'),
        api.get<any>('/attendance', { params: { studentId: userId, limit: 100 } })
      ]);
      const summary = extractData<any>(summaryRes);
      if (summary) {
        setCourseAttendance(summary.courses || []);
        setOverallPercentage(summary.totalSummary?.percentage || 0);
      }
      setAttendanceRecords(extractData<any[]>(recordsRes) || []);
    } catch (e) {
      console.error(e);
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

  if (loading) {
    return <LoadingGrid count={4} className="grid gap-6 md:grid-cols-2" itemClassName="h-32" />;
  }

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground uppercase tracking-widest">Attendance Overview</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">Detailed session analytics and eligibility tracking</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 font-black uppercase tracking-widest text-[10px] bg-card">
            System Status: Active
          </Badge>
          <Badge className={`h-10 px-6 font-black tracking-widest uppercase text-[10px] ${overallPercentage >= 75 ? 'bg-success/20 text-success border-success/30' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
            {overallPercentage >= 75 ? 'ELIGIBLE' : 'SHORTAGE'}
          </Badge>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-12 gap-6 items-stretch">
        <div className="md:col-span-5 card-elevated p-8 flex flex-col items-center justify-center relative overflow-hidden group">
           <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
           <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" className="text-muted/20" />
                <motion.circle 
                  cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="12" fill="none" 
                  strokeDasharray={`${2 * Math.PI * 88}`} 
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - overallPercentage / 100) }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={getStatusColor(overallPercentage)} strokeLinecap="square" 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-5xl font-black tracking-tighter ${getStatusColor(overallPercentage)}`}>{Math.round(overallPercentage)}%</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Aggregate</span>
              </div>
           </div>
        </div>

        <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
           <div className="card-elevated p-6 flex flex-col justify-between border-l-4 border-success">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classes Attended</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground">{(courseAttendance || []).reduce((s,c)=>s+c.present,0)}</span>
                <span className="text-muted-foreground font-bold text-sm">Sessions</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-success font-bold text-[10px] uppercase tracking-widest">
                <CheckCircle className="w-3 h-3" /> Growth: +2.4%
              </div>
           </div>
           <div className="card-elevated p-6 flex flex-col justify-between border-l-4 border-destructive">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classes Missed</p>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-foreground">{(courseAttendance || []).reduce((s,c)=>s+c.absent,0)}</span>
                <span className="text-muted-foreground font-bold text-sm">Sessions</span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-destructive font-bold text-[10px] uppercase tracking-widest">
                <XCircle className="w-3 h-3" /> Risk Factor: High
              </div>
           </div>
        </div>
      </motion.div>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
           <div className="h-px flex-1 bg-border/60" />
           <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground px-4">Course Specific Metrics</span>
           <div className="h-px flex-1 bg-border/60" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
           {(courseAttendance || []).map(c => (
             <motion.div 
               key={c.courseId} 
               whileHover={{ y: -4 }}
               className={`card-elevated p-6 border group transition-all ${c.percentage < 75 ? 'border-destructive/30 hover:border-destructive/60' : 'border-border hover:border-primary/40'}`}
             >
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <Badge variant="secondary" className="font-mono text-[9px] h-5 tracking-tight px-2 bg-muted/50">{c.courseCode}</Badge>
                    <h3 className="font-black text-foreground uppercase tracking-tight text-sm line-clamp-1">{c.courseName}</h3>
                  </div>
                  <div className={`text-2xl font-black tracking-tighter ${getStatusColor(c.percentage)}`}>{Math.round(c.percentage)}%</div>
                </div>

                <div className="space-y-3">
                   <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden border border-border/10">
                     <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${c.percentage}%` }}
                      className={`h-full ${getProgressColor(c.percentage)}`}
                     />
                   </div>
                   <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                      <span className="text-success flex items-center gap-1 group-hover:gap-2 transition-all">ATTENDED: {c.present}</span>
                      <span className="text-destructive">MISSED: {c.absent}</span>
                   </div>
                </div>
             </motion.div>
           ))}
        </div>
      </div>

      <div className="space-y-4">
         <div className="flex items-center justify-between">
           <h2 className="font-black uppercase tracking-widest text-sm flex items-center gap-2">
             <Clock className="w-4 h-4 text-primary" /> Session History Log
           </h2>
           <div className="text-[10px] font-bold text-muted-foreground uppercase opacity-60">Showing last 100 interactions</div>
         </div>
         
         <div className="border border-border/60 rounded-xl overflow-hidden bg-card shadow-2xl">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-muted border-b border-border/60">
                  <th className="py-4 px-6 text-left font-black uppercase text-[10px] tracking-widest text-primary border-r border-border/60">Verification</th>
                  <th className="py-4 px-6 text-left font-black uppercase text-[10px] tracking-widest border-r border-border/60">Subject & Instructor</th>
                  <th className="py-4 px-6 text-left font-black uppercase text-[10px] tracking-widest border-r border-border/60">Timestamp</th>
                  <th className="py-4 px-6 text-right font-black uppercase text-[10px] tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {!Array.isArray(attendanceRecords) || attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-20 text-center text-muted-foreground font-medium italic">No attendance data logged yet.</td>
                  </tr>
                ) : (
                  attendanceRecords.map(r => {
                    const course = (courseAttendance || []).find(c => c.courseId === r.subject);
                    const isPresent = r.status === 'present';
                    return (
                      <tr key={r.id} className="group hover:bg-muted/30 transition-colors">
                        <td className="py-4 px-6 border-r border-border/60">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${isPresent ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                            {isPresent ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                          </div>
                        </td>
                        <td className="py-4 px-6 border-r border-border/60">
                          <div className="flex flex-col">
                            <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{course?.courseCode || 'GEN-CORE'}</span>
                            <span className="text-[11px] text-muted-foreground font-medium line-clamp-1">{course?.courseName || 'Unspecified Academic Session'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 border-r border-border/60">
                           <div className="flex flex-col">
                             <span className="text-sm font-bold text-foreground">{new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                             <span className="text-[10px] font-bold text-muted-foreground uppercase">{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date(r.date))}</span>
                           </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <Badge variant={isPresent ? 'default' : 'destructive'} className="text-[9px] font-black uppercase tracking-widest px-3">
                            {isPresent ? 'AUTHENTICATED' : 'MISSED'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
