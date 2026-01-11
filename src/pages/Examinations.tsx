import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  TrendingUp,
  Award,
  Calendar,
  ChevronDown,
  ChevronUp,
  Download,
  Shield,
  Loader2,
  Plus,
  Trash2,
  Save,
  Upload,
  Search,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  deleteDoc,
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
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import { exportGradeSheet } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';

export default function Examinations() {
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

  if (loading) return <div className="flex justify-center min-h-screen items-center"><Loader2 className="animate-spin w-8 h-8 text-primary"/></div>;

  if (isAdmin || isFaculty) {
    return <ExaminationsManager userId={user.uid} userRole={user.role} />;
  }

  return <StudentExaminationsView userId={user.uid} />;
}

function ExaminationsManager({ userId, userRole }: { userId: string, userRole: string }) {
  const [activeTab, setActiveTab] = useState('schedule');
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  // Schedule State
  const [schedules, setSchedules] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    courseId: '',
    date: '',
    startTime: '',
    endTime: '',
    room: '',
    type: 'Final'
  });

  // Grades State
  const [students, setStudents] = useState<any[]>([]); // { id, name, gradeData }
  const [loading, setLoading] = useState(false);

  const isAdmin = userRole.includes('admin');

  useEffect(() => {
    fetchCourses();
    fetchSchedules();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'grades' && selectedCourse) {
      fetchStudentsForGrade();
    }
  }, [activeTab, selectedCourse]);

  const fetchCourses = async () => {
    let q = query(collection(db, 'courses'));
    const snap = await getDocs(q);
    let data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
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
        const userDoc = await getDoc(doc(db, 'users', userId));
        const userDept = userDoc.data()?.department;
        if (userDept) {
          data = data.filter(course => course.department === userDept);
        }
      }
    }
    
    setCourses(data);
  };

  const fetchSchedules = async () => {
    const snap = await getDocs(collection(db, 'examSchedules'));
    setSchedules(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  const handleAddSchedule = async () => {
    if (!scheduleForm.courseId || !scheduleForm.date) return toast.error('Required fields missing');
    const course = courses.find(c => c.id === scheduleForm.courseId);
    
    await addDoc(collection(db, 'examSchedules'), {
      ...scheduleForm,
      courseName: course?.name,
      courseCode: course?.code,
      createdAt: serverTimestamp()
    });
    toast.success('Schedule added');
    fetchSchedules();
  };

  const handleDeleteSchedule = async (id: string) => {
    if (!confirm('Delete schedule?')) return;
    await deleteDoc(doc(db, 'examSchedules', id));
    toast.success('Deleted');
    fetchSchedules();
  };

  const fetchStudentsForGrade = async () => {
    setLoading(true);
    try {
      // 1. Enrollments
      const enSnap = await getDocs(query(collection(db, 'enrollments'), where('courseId', '==', selectedCourse), where('status', '==', 'active')));
      const enrolled = enSnap.docs.map(d => ({ sid: d.data().studentId }));
      
      // 2. Users
      const users = await Promise.all(enrolled.map(async (e) => {
        const u = await getDoc(doc(db, 'users', e.sid));
        return { id: e.sid, name: u.data()?.fullName || 'Unknown', email: u.data()?.email };
      }));

      // 3. Existing Grades
      const gSnap = await getDocs(query(collection(db, 'grades'), where('courseId', '==', selectedCourse)));
      const gradeMap: any = {};
      gSnap.docs.forEach(d => gradeMap[d.data().studentId] = { id: d.id, ...d.data() });

      setStudents(users.map(u => ({
        ...u,
        gradeData: gradeMap[u.id] || { midterm: '', final: '', total: '', grade: '', credits: '' }
      })));
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleGradeChange = (studentId: string, field: string, value: string) => {
    setStudents(prev => prev.map(s => s.id === studentId ? {
      ...s, gradeData: { ...s.gradeData, [field]: value }
    } : s));
  };

  const handleSaveGrades = async () => {
    try {
      const course = courses.find(c => c.id === selectedCourse);
      const batchPromises = students.map(async (s) => {
        const gd = s.gradeData;
        if (!gd.grade && !gd.total) return; // Skip empty
        
        const data = {
          studentId: s.id,
          courseId: selectedCourse,
          courseName: course?.name,
          courseCode: course?.code,
          academicYear: '2023-2024', // Default for now
          semester: course?.semester || 1,
          credits: Number(gd.credits) || course?.credits || 0,
          midtermMarks: Number(gd.midterm) || 0,
          finalMarks: Number(gd.final) || 0,
          totalMarks: Number(gd.total) || 0,
          maxMarks: 100,
          grade: gd.grade,
          gradePoints: calculateGradePoints(gd.grade),
          updatedAt: serverTimestamp()
        };

        if (gd.id) {
          await updateDoc(doc(db, 'grades', gd.id), data);
        } else {
          await addDoc(collection(db, 'grades'), data);
        }
      });
      await Promise.all(batchPromises);
      toast.success('Grades saved');
      fetchStudentsForGrade();
    } catch (e) { toast.error('Failed to save'); }
  };

  const calculateGradePoints = (grade: string) => {
    if (grade === 'A+') return 10;
    if (grade === 'A') return 9;
    if (grade === 'B+') return 8;
    if (grade === 'B') return 7;
    if (grade === 'C') return 6;
    if (grade === 'D') return 5;
    if (grade === 'F') return 0;
    return 0;
  };

  const handleBulkImport = async (data: any[]) => {
    // Determine type based on active tab
    if (activeTab === 'schedule') {
      // Import schedule
      for (const row of data) {
         // row: courseCode, date, startTime, endTime, room, type
         const course = courses.find(c => c.code === row.courseCode);
         if (!course) continue;
         await addDoc(collection(db, 'examSchedules'), {
             courseId: course.id,
             courseName: course.name,
             courseCode: course.code,
             date: row.date,
             startTime: row.startTime,
             endTime: row.endTime,
             room: row.room,
             type: row.type || 'Final',
             createdAt: serverTimestamp()
         });
      }
      fetchSchedules();
      return { success: data.length, failed: 0, errors: [] };
    } else {
      // Import Grades
      // row: studentEmail, courseCode, semester, (marks...)
      let success = 0; let failed = 0; const errors: string[] = [];
      for (const row of data) {
        try {
          const course = courses.find(c => c.code === row.courseCode);
          if (!course) throw new Error('Course not found');
          
          const uSnap = await getDocs(query(collection(db, 'users'), where('email', '==', row.studentEmail)));
          if (uSnap.empty) throw new Error('Student not found');
          const sid = uSnap.docs[0].id;

          // Check exists
          const gSnap = await getDocs(query(collection(db, 'grades'), where('studentId', '==', sid), where('courseId', '==', course.id)));
          
          const gradeData = {
              studentId: sid,
              courseId: course.id,
              courseName: course.name,
              courseCode: course.code,
              semester: Number(row.semester) || course.semester,
              academicYear: row.academicYear || '2023-2024',
              midtermMarks: Number(row.midterm) || 0,
              finalMarks: Number(row.final) || 0,
              totalMarks: Number(row.total) || 0,
              grade: row.grade,
              gradePoints: calculateGradePoints(row.grade),
              credits: Number(row.credits) || course.credits,
              maxMarks: 100,
              updatedAt: serverTimestamp()
          };

          if (!gSnap.empty) {
             await updateDoc(doc(db, 'grades', gSnap.docs[0].id), gradeData);
          } else {
             await addDoc(collection(db, 'grades'), gradeData);
          }
          success++;
        } catch (e) { failed++; errors.push((e as Error).message); }
      }
      if (selectedCourse) fetchStudentsForGrade();
      return { success, failed, errors };
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Exam & Grades Manager</h1>
          <p className="text-muted-foreground">Manage schedules and student grades</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'grades' && selectedCourse && (
            <PDFExportButton
              onExport={async () => {
                const course = courses.find(c => c.id === selectedCourse);
                const gradesData = students.map(s => ({
                  studentName: s.name,
                  enrollmentNumber: s.email,
                  internalMarks: s.gradeData.midterm || '-',
                  externalMarks: s.gradeData.final || '-',
                  totalMarks: s.gradeData.total || '-',
                  grade: s.gradeData.grade || '-'
                }));
                exportGradeSheet(course?.name || 'Course', gradesData);
              }}
              label="Export Grade Sheet"
              variant="outline"
            />
          )}
          <Button variant="outline" onClick={() => setShowBulkUpload(true)}><Upload className="w-4 h-4 mr-2"/> Bulk Upload</Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
         <TabsList>
           <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
           <TabsTrigger value="grades">Grades</TabsTrigger>
         </TabsList>
         
         <TabsContent value="schedule" className="space-y-4">
           {/* Add Schedule Form */}
           <div className="card-elevated p-4 grid gap-4 md:grid-cols-6 items-end">
              <div className="md:col-span-2">
                 <label className="text-xs">Course</label>
                 <Select onValueChange={v => setScheduleForm({...scheduleForm, courseId: v})}>
                    <SelectTrigger><SelectValue placeholder="Course"/></SelectTrigger>
                    <SelectContent>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>)}</SelectContent>
                 </Select>
              </div>
              <div><label className="text-xs">Date</label><Input type="date" onChange={e=>setScheduleForm({...scheduleForm, date: e.target.value})}/></div>
              <div><label className="text-xs">Time</label><Input type="time" onChange={e=>setScheduleForm({...scheduleForm, startTime: e.target.value})}/></div>
              <div><label className="text-xs">Room</label><Input placeholder="Room" onChange={e=>setScheduleForm({...scheduleForm, room: e.target.value})}/></div>
              <Button onClick={handleAddSchedule}><Plus className="w-4 h-4 mr-2"/> Add</Button>
           </div>
           
           <div className="card-elevated p-4">
              <h3 className="font-semibold mb-4">Upcoming Exams</h3>
              <div className="space-y-2">
                 {schedules.map(s => (
                   <div key={s.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{s.courseName} ({s.courseCode})</p>
                        <p className="text-xs text-muted-foreground">{s.date?.toDate?.().toLocaleDateString() || s.date} | {s.startTime} - {s.endTime} | {s.room}</p>
                      </div>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteSchedule(s.id)}><Trash2 className="w-4 h-4 text-destructive"/></Button>
                   </div>
                 ))}
              </div>
           </div>
         </TabsContent>
         
         <TabsContent value="grades" className="space-y-4">
            <div className="card-elevated p-4">
               <label className="text-sm font-medium mb-1 block">Select Course to Grade</label>
               <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                  <SelectTrigger><SelectValue placeholder="Choose Course..."/></SelectTrigger>
                  <SelectContent>{courses.map(c=><SelectItem key={c.id} value={c.id}>{c.code} - {c.name}</SelectItem>)}</SelectContent>
               </Select>
            </div>
            
            {selectedCourse && (
              <div className="card-elevated p-4 overflow-x-auto">
                 <table className="w-full min-w-[800px]">
                   <thead className="bg-muted/30">
                     <tr>
                       <th className="p-2 text-left">Student</th>
                       <th className="p-2 w-20">Mid</th>
                       <th className="p-2 w-20">Final</th>
                       <th className="p-2 w-20">Total</th>
                       <th className="p-2 w-20">Grade</th>
                       <th className="p-2 w-20">Cr</th>
                     </tr>
                   </thead>
                   <tbody>
                     {loading ? <tr><td colSpan={6} className="p-4 text-center">Loading...</td></tr> : students.map(s => (
                       <tr key={s.id} className="border-b">
                          <td className="p-2">
                            <p className="font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.email}</p>
                          </td>
                          <td className="p-2"><Input className="h-8" value={s.gradeData.midterm} onChange={e=>handleGradeChange(s.id, 'midterm', e.target.value)}/></td>
                          <td className="p-2"><Input className="h-8" value={s.gradeData.final} onChange={e=>handleGradeChange(s.id, 'final', e.target.value)}/></td>
                          <td className="p-2"><Input className="h-8" value={s.gradeData.total} onChange={e=>handleGradeChange(s.id, 'total', e.target.value)}/></td>
                          <td className="p-2"><Input className="h-8 bg-muted/20 font-bold" value={s.gradeData.grade} onChange={e=>handleGradeChange(s.id, 'grade', e.target.value)}/></td>
                          <td className="p-2"><Input className="h-8" value={s.gradeData.credits} onChange={e=>handleGradeChange(s.id, 'credits', e.target.value)}/></td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
                 <div className="flex justify-end mt-4">
                   <Button onClick={handleSaveGrades}><Save className="w-4 h-4 mr-2"/> Save Grades</Button>
                 </div>
              </div>
            )}
         </TabsContent>
      </Tabs>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl">
           <DialogHeader><DialogTitle>Bulk Upload {activeTab === 'schedule' ? 'Schedule' : 'Grades'}</DialogTitle></DialogHeader>
           <BulkUpload 
              entityType={activeTab === 'schedule' ? 'exams' : 'grades'} 
              onImport={handleBulkImport} 
              templateColumns={activeTab === 'schedule' ? 
                ['courseCode', 'date', 'startTime', 'endTime', 'room', 'type'] : 
                ['studentEmail', 'courseCode', 'midterm', 'final', 'total', 'grade', 'credits']}
           />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StudentExaminationsView({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [semesters, setSemesters] = useState<any[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [cgpa, setCgpa] = useState(0);
  const [totalCredits, setTotalCredits] = useState(0);
  const [expandedSemester, setExpandedSemester] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      const uDoc = await getDoc(doc(db, 'users', userId));
      setUserData(uDoc.data());

      // Grades
      const gSnap = await getDocs(query(collection(db, 'grades'), where('studentId', '==', userId)));
      const grades = gSnap.docs.map(d => ({id: d.id, ...d.data()})) as any[];
      
      // Group by Semester
      const semMap: any = {};
      grades.forEach(g => {
        const key = `${g.semester}-${g.academicYear}`;
        if (!semMap[key]) semMap[key] = { semester: g.semester, academicYear: g.academicYear, grades: [], totalCredits: 0, totalPoints: 0 };
        semMap[key].grades.push(g);
        semMap[key].totalCredits += Number(g.credits);
        semMap[key].totalPoints += (Number(g.credits) * Number(g.gradePoints));
      });

      const semData = Object.values(semMap).map((s: any) => ({
        ...s,
        sgpa: s.totalCredits > 0 ? (Math.round((s.totalPoints / s.totalCredits) * 100) / 100) : 0
      }));
      
      setSemesters(semData.sort((a: any, b: any) => b.semester - a.semester));
      if (semData.length > 0) setExpandedSemester(semData[0].semester);

      // Calc CGPA
      const grandTotalCredits = semData.reduce((sum: number, s: any) => sum + s.totalCredits, 0);
      const grandTotalPoints = semData.reduce((sum: number, s: any) => sum + s.totalPoints, 0);
      setCgpa(grandTotalCredits > 0 ? (Math.round((grandTotalPoints / grandTotalCredits) * 100) / 100) : 0);
      setTotalCredits(grandTotalCredits);

      // Schedule (My Courses)
      const enSnap = await getDocs(query(collection(db, 'enrollments'), where('studentId', '==', userId)));
      const myCourseIds = enSnap.docs.map(d => d.data().courseId);
      
      const sSnap = await getDocs(collection(db, 'examSchedules'));
      const allSchedules = sSnap.docs.map(d => ({id:d.id, ...d.data()})) as any[];
      setSchedules(allSchedules.filter(s => myCourseIds.includes(s.courseId) || grades.some(g => g.courseId === s.courseId))); // fallback to grades if no enrollment
      
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-success';
    if (grade.startsWith('B')) return 'text-primary';
    if (grade.startsWith('C')) return 'text-warning';
    return 'text-destructive';
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Examinations & Grades</h1>
        <p className="text-muted-foreground">My academic performance</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card-elevated p-4 flex gap-3 items-center">
           <div className="p-2 rounded bg-primary/10"><TrendingUp className="text-primary w-5 h-5"/></div>
           <div><p className="text-sm text-muted-foreground">CGPA</p><p className="text-2xl font-bold">{cgpa}</p></div>
        </div>
        <div className="card-elevated p-4 flex gap-3 items-center">
           <div className="p-2 rounded bg-success/10"><Award className="text-success w-5 h-5"/></div>
           <div><p className="text-sm text-muted-foreground">Credits</p><p className="text-2xl font-bold">{totalCredits}</p></div>
        </div>
      </div>

      <Tabs defaultValue="schedule">
        <TabsList>
           <TabsTrigger value="schedule">Exam Schedule</TabsTrigger>
           <TabsTrigger value="grades">Gradebook</TabsTrigger>
           <TabsTrigger value="transcript">Transcript</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule" className="space-y-4">
           {schedules.length === 0 ? <p className="text-center text-muted-foreground p-8">No upcoming exams</p> : (
             <div className="grid gap-4 md:grid-cols-2">
                {schedules.map(s => (
                  <div key={s.id} className="card-elevated p-4 flex justify-between items-center border-l-4 border-l-primary">
                     <div>
                        <h3 className="font-semibold">{s.courseName}</h3>
                        <div className="flex bg-muted/20 rounded p-1 mt-2 text-xs gap-3">
                           <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {s.date?.toDate?.().toLocaleDateString() || s.date}</span>
                           <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {s.startTime} - {s.endTime}</span>
                        </div>
                     </div>
                     <Badge>{s.type}</Badge>
                  </div>
                ))}
             </div>
           )}
        </TabsContent>

        <TabsContent value="grades" className="space-y-4">
           {semesters.map(sem => (
             <div key={sem.semester} className="card-elevated border bg-card text-card-foreground shadow-sm rounded-lg overflow-hidden">
                <div onClick={() => setExpandedSemester(expandedSemester === sem.semester ? null : sem.semester)} 
                     className="p-4 flex justify-between items-center cursor-pointer hover:bg-muted/10">
                   <div>
                      <h3 className="font-semibold">Semester {sem.semester}</h3>
                      <p className="text-xs text-muted-foreground">{sem.academicYear} | SGPA: {sem.sgpa}</p>
                   </div>
                   {expandedSemester === sem.semester ? <ChevronUp/> : <ChevronDown/>}
                </div>
                {expandedSemester === sem.semester && (
                   <div className="border-t p-4 overflow-x-auto">
                      <table className="w-full text-sm">
                         <thead><tr className="text-muted-foreground text-left"><th>Course</th><th>Cr</th><th>Total</th><th>Grade</th></tr></thead>
                         <tbody className="divide-y">
                            {sem.grades.map((g: any) => (
                              <tr key={g.id}>
                                 <td className="py-2">{g.courseCode} - {g.courseName}</td>
                                 <td>{g.credits}</td>
                                 <td>{g.totalMarks}</td>
                                 <td className={getGradeColor(g.grade)}>{g.grade}</td>
                              </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                )}
             </div>
           ))}
        </TabsContent>

        <TabsContent value="transcript">
           <div className="card-elevated p-8 bg-white text-black dark:bg-zinc-900 dark:text-white">
              <div className="flex justify-between border-b pb-4 mb-4">
                 <h2 className="text-xl font-bold font-serif">OFFICIAL TRANSCRIPT</h2>
                 <Shield className="w-8 h-8 opacity-20"/>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                 <div><p className="text-muted-foreground">Name</p><p className="font-bold">{userData?.fullName}</p></div>
                 <div><p className="text-muted-foreground">Enrollment No.</p><p className="font-bold">{userData?.enrollmentNumber || 'N/A'}</p></div>
                 <div><p className="text-muted-foreground">CGPA</p><p className="font-bold">{cgpa}</p></div>
              </div>
              <table className="w-full text-sm border-collapse border">
                 <thead><tr className="bg-muted/20"><th className="border p-2">Sem</th><th className="border p-2">Course</th><th className="border p-2">Cr</th><th className="border p-2">Grade</th></tr></thead>
                 <tbody>
                    {semesters.flatMap(s => s.grades.map((g: any) => (
                      <tr key={g.id}>
                         <td className="border p-2 text-center">{s.semester}</td>
                         <td className="border p-2">{g.courseCode}</td>
                         <td className="border p-2 text-center">{g.credits}</td>
                         <td className="border p-2 text-center font-bold">{g.grade}</td>
                      </tr>
                    )))}
                 </tbody>
              </table>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
