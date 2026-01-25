import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardCheck,
  FileText,
  Briefcase,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
  Loader2,
  Camera,
  MapPin,
  User,
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, documentId } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import QRAttendanceScanner from '@/components/attendance/QRAttendanceScanner';
import type { 
  StudentProfile, 
  Course, 
  Assignment, 
  AttendanceRecord, 
  Grade 
} from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface StudentStats {
  attendancePercentage: number;
  cgpa: number;
  enrolledCourses: number;
  pendingAssignments: number;
}

export function StudentDashboard() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [semesterGrades, setSemesterGrades] = useState<{semester: string, sgpa: number}[]>([]); 
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: 0,
    cgpa: 0,
    enrolledCourses: 0,
    pendingAssignments: 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [upcomingAssignments, setUpcomingAssignments] = useState<Assignment[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        // Parallel fetch for User and Profile
        const [userDoc, profileDoc] = await Promise.all([
          getDoc(doc(db, 'users', user.uid)),
          getDoc(doc(db, 'studentProfiles', user.uid))
        ]);

        const userInfo = userDoc.data();
        const pData = profileDoc.data() as StudentProfile;

        if (userInfo) {
            setFirstName(userInfo.fullName?.split(' ')[0] || 'Student');
        }
        setProfileData(pData);

        if (userInfo?.role === 'student' && pData) {
          await fetchStudentStats(user.uid, pData);
        }
      } catch (error) {
        console.error('Error fetching initial data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchStudentStats = async (userId: string, profile: StudentProfile) => {
    try {
      // 1. Fetch Enrollments first to get Course IDs
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('status', '==', 'active')
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      
      const enrolledCount = enrolledCourseIds.length;
      
      // 2. Fetch Core Data (Grades need to be fetched first to get course IDs)
      const corePromises = [
        getDocs(query(collection(db, 'attendance'), where('studentId', '==', userId))),
        getDocs(query(collection(db, 'grades'), where('studentId', '==', userId))),
        getDocs(query(collection(db, 'applications'), where('studentId', '==', userId))),
        getDocs(query(collection(db, 'submissions'), where('studentId', '==', userId))),
      ];
      
      const [attendanceSnap, gradesSnap, appsSnap, submissionsSnap] = await Promise.all(corePromises);

      // 3. Process Courses (Enrolled + Graded)
      // Collect unique course IDs from both enrollments and grades
      const gradeCourseIds = gradesSnap.docs.map((doc: any) => doc.data().courseId).filter((id: any) => id);
      const allCourseIds = Array.from(new Set([...enrolledCourseIds, ...gradeCourseIds]));

      // 4. Fetch Secondary Data (Courses, Assignments, Timetable)
      const secondaryPromises = [];
      
      // Fetch Courses
      if (allCourseIds.length > 0) {
          secondaryPromises.push(Promise.all(allCourseIds.map(id => getDoc(doc(db, 'courses', id)))));
      } else {
          secondaryPromises.push(Promise.resolve([])); 
      }

      // Fetch Assignments (only for enrolled)
      if (enrolledCourseIds.length > 0) {
          // Chunking 'in' query if needed, but safe slice for now
          const assignmentQuery = query(
                collection(db, 'assignments'),
                where('courseId', 'in', enrolledCourseIds.slice(0, 30))
          );
          secondaryPromises.push(getDocs(assignmentQuery));
      } else {
          secondaryPromises.push(Promise.resolve({ docs: [] }));
      }
      
      // Fetch Timetable
      if (profile.department && profile.semester) {
          const timetableQuery = query(
            collection(db, 'timetable'),
            where('department', '==', profile.department),
            where('semester', '==', profile.semester)
          );
          secondaryPromises.push(getDocs(timetableQuery));
      } else {
          secondaryPromises.push(Promise.resolve({ docs: [] }));
      }

      const [coursesResult, assignmentsSnap, timetableSnap] = await Promise.all(secondaryPromises);

      // --- Process Attendance ---
      const attendanceRecords = attendanceSnap.docs.map((d: any) => d.data());
      const present = attendanceRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      const totalAttendance = attendanceRecords.length;
      const attendancePercentage = totalAttendance > 0 ? Math.round((present / totalAttendance) * 100) : 0;

      // --- Process Courses ---
      let allCoursesData: Course[] = [];
      if (Array.isArray(coursesResult)) { 
          allCoursesData = coursesResult
            .filter(d => d.exists())
            .map((d: any) => ({ id: d.id, ...d.data() } as Course));
      }
      // Filter for enrolled list display
      setEnrolledCoursesList(allCoursesData.filter(c => enrolledCourseIds.includes(c.id)));

      // --- Process Grades & CGPA ---
      // --- Process Grades & CGPA ---
      const grades = gradesSnap.docs.map((d: any) => d.data());
      
      // Helper to parse grades safely
      const parsedGrades = grades.map((g: any) => ({
          ...g,
          semester: Number(g.semester) || 0,
          credits: Number(g.credits) || 3, // Default to 3 credits if missing to prevent 0-height bars
          gradePoints: Number(g.gradePoints) || 0
      }));

      // Calculate stats per semester first
      const semStats: Record<number, {points: number, credits: number}> = {};
      
      parsedGrades.forEach((grade: any) => {
           // Fallback semester from course if 0 (though we defaulted credits, semester is crucial)
           let sem = grade.semester;
           if (sem === 0 && grade.courseId) {
                const c = allCoursesData.find(course => course.id === grade.courseId);
                if (c) sem = c.semester;
           }
           
           if (sem > 0) {
               if (!semStats[sem]) semStats[sem] = { points: 0, credits: 0 };
               semStats[sem].points += (grade.gradePoints * grade.credits);
               semStats[sem].credits += grade.credits;
           }
      });

      // Calculate Cumulative GPA (CGPA) trend
      let runningPoints = 0;
      let runningCredits = 0;
      
      const semData = Object.keys(semStats)
        .map(Number)
        .sort((a, b) => a - b)
        .map(sem => {
            const current = semStats[sem];
            
            // For trend line/bar, user wants Cumulative Performance
            runningPoints += current.points;
            runningCredits += current.credits;
            
            const sgpa = current.credits > 0 ? (current.points / current.credits) : 0;
            const cgpa = runningCredits > 0 ? (runningPoints / runningCredits) : 0;

            return {
                semester: `S${sem}`, // Short label S1, S2
                sgpa: Number(sgpa.toFixed(2)),
                cgpa: Number(cgpa.toFixed(2)), // We will plot this
                displayValue: Number(cgpa.toFixed(2)) // Universal key for the render
            };
        });
        
      setSemesterGrades(semData as any);

      // --- Process Assignments ---
      const submissions = submissionsSnap.docs.map((d: any) => d.data().assignmentId);
      const allAssignments = assignmentsSnap.docs ? assignmentsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })) : [];
      
      const pending = allAssignments.filter((a: any) => !submissions.includes(a.id));
      const pendingCount = pending.length;

      // Sort Assignments
      const upcoming = pending
        .sort((a: any, b: any) => {
          const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate);
          const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3)
        .map((a: any) => {
            const course = allCoursesData.find(c => c.id === a.courseId);
            return {
                ...a,
                courseCode: course?.code || 'N/A',
                courseName: course?.name || 'Unknown'
            };
        });
      setUpcomingAssignments(upcoming);

      // --- Process Applications ---
      setApplications(appsSnap.docs.map((d: any) => ({ id: d.id, ...d.data() })));

      // --- Process Timetable (Smart Schedule) ---
      if (timetableSnap && timetableSnap.docs) {
          const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
          
          let scheduleItems = timetableSnap.docs.map(d => d.data());
          let activeDay = todayStr;
          let displayLabel = "Today";
          
          // Helper to get formatted schedule for a specific day
          const getScheduleForDay = (dayName: string) => {
             return scheduleItems
                .filter((item: any) => item.day === dayName)
                .map((item: any) => {
                    const course = allCoursesData.find(c => c.code === item.courseCode);
                    return {
                        ...item,
                        courseName: course?.name || 'Unknown Course',
                        instructor: course?.instructor || 'TBA',
                        startTime: item.timeSlot?.split('-')[0] || '09:00',
                        endTime: item.timeSlot?.split('-')[1] || '10:00',
                    };
                })
                .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
          };

          let activeSchedule = getScheduleForDay(todayStr);

          // If no classes today, find next working day
          if (activeSchedule.length === 0) {
             const todayIndex = daysOfWeek.indexOf(todayStr);
             for (let i = 1; i < 7; i++) {
                const nextDayIndex = (todayIndex + i) % 7;
                const nextDay = daysOfWeek[nextDayIndex];
                const nextSchedule = getScheduleForDay(nextDay);
                
                if (nextSchedule.length > 0) {
                   activeSchedule = nextSchedule;
                   activeDay = nextDay;
                   displayLabel = i === 1 ? "Tomorrow" : nextDay;
                   break;
                }
             }
          }
          
          setTodayClasses(activeSchedule);
          setScheduleDay(displayLabel);
      }

      // Update Stats State
      const latestCGPA = semData.length > 0 ? semData[semData.length - 1].cgpa : 0;
      setStats({
        attendancePercentage,
        cgpa: latestCGPA,
        enrolledCourses: enrolledCount,
        pendingAssignments: pendingCount,
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
       <div className="space-y-6">
          <div className="flex justify-between items-center">
             <div className="space-y-2">
                <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
             </div>
             <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
             {[1,2,3,4].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-xl" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
             <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
             <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Welcome back, {firstName}! 👋
          </h1>
          <p className="text-muted-foreground">
            {profileData?.enrollmentNumber || 'Student'} • {profileData?.department || 'Department'} • Semester {profileData?.semester || '-'}
          </p>
        </div>
        <Button 
          onClick={() => setShowQRScanner(true)}
          variant="gradient"
          className="w-full md:w-auto"
        >
          <Camera className="w-4 h-4 mr-2" />
          Mark Attendance
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <motion.div 
            variants={item} 
            className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/examinations` : '/examinations')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/10">
              <TrendingUp className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">CGPA</p>
              <p className="text-2xl font-bold text-foreground">{stats.cgpa || '-'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
            variants={item} 
            className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/attendance` : '/attendance')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <ClipboardCheck className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Attendance</p>
              <p className="text-2xl font-bold text-foreground">{stats.attendancePercentage}%</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
            variants={item} 
            className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/courses` : '/courses')}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-foreground/10">
              <BookOpen className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Enrolled Courses</p>
              <p className="text-2xl font-bold text-foreground">{stats.enrolledCourses}</p>
            </div>
          </div>
        </motion.div>

        <motion.div 
            variants={item} 
            className="card-elevated p-5 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}
        >
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${stats.pendingAssignments > 0 ? 'bg-warning/10' : 'bg-muted'}`}>
              <FileText className={`w-5 h-5 ${stats.pendingAssignments > 0 ? 'text-warning' : 'text-muted-foreground'}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Tasks</p>
              <p className="text-2xl font-bold text-foreground">{stats.pendingAssignments}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Enrolled Courses - Primary */}
        <motion.div variants={item} className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-accent" />
              My Enrolled Courses
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(orgSlug ? `/${orgSlug}/courses` : '/courses')}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {enrolledCoursesList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No active enrollments</p>
            ) : (
              enrolledCoursesList.slice(0, 4).map((course, idx) => (
                <div 
                    key={idx} 
                    className="p-4 rounded-xl border border-border bg-card/50 hover:bg-accent/50 hover:border-accent transition-all group cursor-pointer relative overflow-hidden"
                    onClick={() => navigate(orgSlug ? `/${orgSlug}/courses/${course.id}` : `/courses/${course.id}`)}
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div>
                      <Badge variant="outline" className="mb-2 bg-background/50 backdrop-blur-sm">{course.code}</Badge>
                      <p className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">{course.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground font-medium uppercase tracking-wider relative z-10">
                    <span>{course.credits} Credits</span>
                    <span className="group-hover:text-primary transition-colors">Sem {course.semester}</span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))
            )}
            {enrolledCoursesList.length > 4 && (
                <div className="col-span-2 flex justify-center mt-2">
                    <Button variant="link" size="sm" onClick={() => navigate(orgSlug ? `/${orgSlug}/courses` : '/courses')} className="text-xs text-muted-foreground">
                        +{enrolledCoursesList.length - 4} more courses
                    </Button>
                </div>
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {scheduleDay}'s Schedule
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(orgSlug ? `/${orgSlug}/timetable` : '/timetable')}>
              Full
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No classes scheduled</p>
              </div>
            ) : (
              todayClasses.map((cls, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/10">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-foreground">{cls.courseCode}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1 border-l border-border pl-2">{cls.courseName}</span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                            <User className="w-3 h-3" /> {cls.instructor}
                        </p>
                    </div>
                    <Badge variant="outline" className="text-[10px] bg-background whitespace-nowrap">{cls.startTime} - {cls.endTime}</Badge>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium uppercase tracking-wider">
                    <MapPin className="w-3 h-3" />
                    {cls.room}
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* My Applications */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-foreground" />
              Applications
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(orgSlug ? `/${orgSlug}/placements` : '/placement')}>
              Browse
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active applications</p>
            ) : (
              applications.slice(0, 3).map((app) => (
                <div key={app.id} className="p-3 rounded-lg border border-border bg-card/50 hover:bg-accent/30 transition-colors">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-foreground line-clamp-1">{app.jobTitle}</span>
                    <Badge variant="outline" className={
                        app.status === 'offered' ? 'text-success border-success/30 bg-success/10' :
                        app.status === 'rejected' ? 'text-destructive border-destructive/30 bg-destructive/10' :
                        'text-primary border-primary/30 bg-primary/10'
                    }>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                     <Briefcase className="w-3 h-3" />
                     {app.companyName}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Upcoming Assignments */}
        <motion.div variants={item} className="lg:col-span-2 card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming Deadlines
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {upcomingAssignments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pending assignments</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {upcomingAssignments.map((assignment: any) => {
                  const dueDate = assignment.dueDate?.toDate?.() || new Date(assignment.dueDate);
                  const daysLeft = Math.ceil((dueDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;

                  return (
                    <div 
                        key={assignment.id} 
                        className="p-3 rounded-xl border border-border group hover:border-warning/30 transition-colors cursor-pointer"
                        onClick={() => navigate(orgSlug ? `/${orgSlug}/assignments` : '/assignments')}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-warning uppercase">{assignment.courseCode}</span>
                        <Badge variant={isUrgent ? 'destructive' : 'secondary'} className="text-[9px]">
                          {daysLeft} days left
                        </Badge>
                      </div>
                      <p className="text-sm font-semibold text-foreground line-clamp-1">{assignment.title}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}

      
      {/* Analytics Section (New) */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
         {/* Grades History */}
         <div 
            className="card-elevated p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/examinations` : '/examinations')}
         >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
               <TrendingUp className="w-5 h-5 text-primary" />
               Performance History
            </h2>
            {semesterGrades.length > 0 ? (
                <div style={{ width: '100%', height: 250 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                            data={semesterGrades}
                            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id="colorCgpa" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                            <XAxis 
                                dataKey="semester" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                                dy={10}
                            />
                            <YAxis 
                                domain={[0, 10]} 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                            />
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: 'hsl(var(--popover))', 
                                    border: '1px solid hsl(var(--border))',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)' 
                                }}
                                formatter={(value: number) => [value, 'CGPA']}
                                labelStyle={{ color: 'hsl(var(--muted-foreground))', marginBottom: '0.25rem' }}
                            />
                            <Area 
                                type="monotone" 
                                dataKey="cgpa" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={2}
                                fillOpacity={1} 
                                fill="url(#colorCgpa)" 
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                   No grade history data
                </div>
            )}
         </div>
         
         {/* Attendance Overview (Quick Graph) */}
         <div 
            className="card-elevated p-6 cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => navigate(orgSlug ? `/${orgSlug}/attendance` : '/attendance')}
         >
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
               <ClipboardCheck className="w-5 h-5 text-success" />
               Attendance Overview
            </h2>
            <div className="flex items-center justify-center h-48">
               <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                     <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
                     <circle 
                        cx="64" cy="64" r="56" 
                        stroke="currentColor" 
                        strokeWidth="12" 
                        fill="transparent" 
                        strokeDasharray={351.86} 
                        strokeDashoffset={351.86 - (351.86 * stats.attendancePercentage) / 100}
                        className={`transition-all duration-1000 ease-out ${stats.attendancePercentage >= 75 ? 'text-success' : stats.attendancePercentage >= 60 ? 'text-warning' : 'text-destructive'}`}
                        strokeLinecap="round"
                     />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-3xl font-bold">{stats.attendancePercentage}%</span>
                     <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Present</span>
                  </div>
               </div>
            </div>
         </div>
      </motion.div>

      {/* QR Attendance Scanner Modal */}
      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <QRAttendanceScanner
            onSuccess={() => {
              setShowQRScanner(false);
              // Refresh attendance data
              if (auth.currentUser && profileData) {
                fetchStudentStats(auth.currentUser.uid, profileData);
              }
            }}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
