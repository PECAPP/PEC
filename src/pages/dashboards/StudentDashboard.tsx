import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardCheck,
  TrendingUp,
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
import { EmptyState, ErrorState, LoadingGrid } from '@/components/common/AsyncState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import QRAttendanceScanner from '@/components/attendance/QRAttendanceScanner';
import type { 
  StudentProfile, 
  Course, 
  AttendanceRecord
} from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06 }
  }
};

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

interface StudentStats {
  attendancePercentage: number;
  cgpa: number;
  enrolledCourses: number;
}

interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  total?: number;
  grade?: string;
  credits?: number;
}

const GRADES_ENDPOINT_DISABLED_KEY = 'api.examinations.grades.disabled';

const isGradesEndpointDisabled = () =>
  typeof window !== 'undefined' && sessionStorage.getItem(GRADES_ENDPOINT_DISABLED_KEY) === '1';

const disableGradesEndpoint = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(GRADES_ENDPOINT_DISABLED_KEY, '1');
  }
};

const isNotFoundError = (error: unknown) =>
  !!(error as any)?.response && (error as any).response.status === 404;

export function StudentDashboard() {
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [semesterGrades, setSemesterGrades] = useState<{semester: string, sgpa: number}[]>([]); 
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: 0,
    cgpa: 0,
    enrolledCourses: 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (user.role !== 'student') {
      navigate('/dashboard', { replace: true });
      return;
    }

    void (async () => {
      try {
        setLoadError(null);
        setFirstName(user.fullName?.split(' ')[0] || 'Student');
        setProfileData({
          department: user.department,
          semester: user.semester,
          enrollmentNumber: user.enrollmentNumber,
        } as any);
        await fetchStudentStats();
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoadError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, navigate]);

  const fetchStudentStats = async () => {
    try {
      setLoadError(null);
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const department = user?.department;
      const semester = user?.semester;
      const skipGrades = isGradesEndpointDisabled();
      const gradesPromise = skipGrades
        ? Promise.resolve({ data: { success: true, data: [] as GradeRecord[] } })
        : api.get<ApiResponse<GradeRecord[]>>('/examinations/grades', {
            params: {
              limit: 200,
              offset: 0,
              ...(user?.uid ? { studentId: user.uid } : {}),
            },
          });

      const [coursesResult, enrollmentsResult, attendanceResult, timetableResult, gradesResult] =
        await Promise.allSettled([
          api.get<ApiResponse<Course[]>>('/courses', {
            params: {
              limit: 200,
              offset: 0,
              ...(department ? { department } : {}),
              ...(semester ? { semester } : {}),
            },
          }),
          api.get<ApiResponse<any>>('/enrollments', {
            params: { limit: 200, offset: 0, status: 'active' },
          }),
          api.get<ApiResponse<AttendanceRecord[]>>('/attendance', {
            params: { limit: 200, offset: 0 },
          }),
          api.get<ApiResponse<any>>('/timetable', {
            params: {
              limit: 200,
              offset: 0,
              ...(department ? { department } : {}),
              ...(semester ? { semester } : {}),
            },
          }),
          gradesPromise,
        ]);

      const allCourses =
        coursesResult.status === 'fulfilled' ? coursesResult.value.data.data || [] : [];
      const enrollments =
        enrollmentsResult.status === 'fulfilled'
          ? enrollmentsResult.value.data.data || []
          : [];
      const attendanceRecords =
        attendanceResult.status === 'fulfilled'
          ? attendanceResult.value.data.data || []
          : [];
      const timetableData =
        timetableResult.status === 'fulfilled'
          ? timetableResult.value.data.data || []
          : [];
      const gradeRecords =
        gradesResult.status === 'fulfilled'
          ? gradesResult.value.data.data || []
          : [];

      if (gradesResult.status === 'rejected' && isNotFoundError(gradesResult.reason)) {
        disableGradesEndpoint();
      }

      const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
      const enrolledCourses = allCourses.filter((c: any) => enrolledCourseIds.has(c.id));
      const enrolledCourseCodes = new Set(
        enrollments
          .map((enrollment: any) => enrollment.courseCode)
          .filter(Boolean),
      );

      setEnrolledCoursesList(enrolledCourses);

      // --- Process Attendance ---
      const present = attendanceRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      const attendancePercentage = attendanceRecords.length > 0 ? Math.round((present / attendanceRecords.length) * 100) : 0;

      // --- Process Timetable ---
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      let scheduleItems = (timetableData || [])
        .filter(
          (t: any) =>
            enrolledCourseIds.has(t.courseId) ||
            enrolledCourseCodes.has(t.courseCode),
        )
        .map((t: any) => ({
          ...t,
          day: t.day,
          courseName:
            allCourses.find((c: any) => c.code === t.courseCode)?.name ||
            t.courseName ||
            'Unknown',
          instructor:
            allCourses.find((c: any) => c.code === t.courseCode)?.instructor ||
            t.facultyName ||
            'TBA',
        }));

      const getScheduleForDay = (dayName: string) => {
        return scheduleItems
          .filter((item: any) => item.day === dayName)
          .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
      };

      let activeSchedule = getScheduleForDay(todayStr);
      let activeDay = todayStr;
      let displayLabel = 'Today';

      if (activeSchedule.length === 0) {
        const todayIndex = daysOfWeek.indexOf(todayStr);
        for (let i = 1; i < 7; i++) {
          const nextDayIndex = (todayIndex + i) % 7;
          const nextDay = daysOfWeek[nextDayIndex];
          const nextSchedule = getScheduleForDay(nextDay);
          
          if (nextSchedule.length > 0) {
            activeSchedule = nextSchedule;
            activeDay = nextDay;
            displayLabel = i === 1 ? 'Tomorrow' : nextDay;
            break;
          }
        }
      }

      setTodayClasses(activeSchedule);
      setScheduleDay(displayLabel);

      // --- Calculate Grades/CGPA from API grades ---
      const courseMap = new Map(allCourses.map((course: any) => [course.id, course]));
      const semesterBuckets = new Map<number, { weightedPoints: number; totalCredits: number }>();

      for (const grade of gradeRecords) {
        const course = courseMap.get(grade.courseId);
        if (!course) continue;

        const semesterKey = Number(course.semester) || 0;
        const credits = Number(grade.credits ?? course.credits ?? 0);
        if (credits <= 0) continue;

        const normalized = typeof grade.total === 'number'
          ? Math.max(0, Math.min(10, grade.total / 10))
          : 0;

        const bucket = semesterBuckets.get(semesterKey) || { weightedPoints: 0, totalCredits: 0 };
        bucket.weightedPoints += normalized * credits;
        bucket.totalCredits += credits;
        semesterBuckets.set(semesterKey, bucket);
      }

      const computedSemesterGrades = Array.from(semesterBuckets.entries())
        .sort((a, b) => a[0] - b[0])
        .map(([semesterValue, values]) => ({
          semester: `S${semesterValue}`,
          cgpa: Number((values.weightedPoints / Math.max(values.totalCredits, 1)).toFixed(2)),
        }));

      setSemesterGrades(computedSemesterGrades);

      const overallCredits = Array.from(semesterBuckets.values()).reduce(
        (sum, value) => sum + value.totalCredits,
        0,
      );
      const overallPoints = Array.from(semesterBuckets.values()).reduce(
        (sum, value) => sum + value.weightedPoints,
        0,
      );
      const computedCgpa = overallCredits > 0
        ? Number((overallPoints / overallCredits).toFixed(2))
        : 0;

      // Update Stats
      setStats({
        attendancePercentage,
        cgpa: computedCgpa,
        enrolledCourses: enrolledCourses.length,
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoadError('Unable to refresh dashboard data.');
      throw error;
    }
  };

  if (loading) {
    return (
       <div className="space-y-6 md:space-y-8">
          <div className="flex justify-between items-center">
             <div className="space-y-2">
                <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
             </div>
             <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-24 rounded-md" />
          <div className="grid gap-5 md:gap-6 xl:grid-cols-3">
             <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
             <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
       </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description={loadError}
        actionLabel="Try again"
        onAction={() => {
          setLoading(true);
          void fetchStudentStats().finally(() => setLoading(false));
        }}
      />
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
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
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
      >
        <motion.div 
            variants={item} 
            className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
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
          className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
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
          className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
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

      </motion.div>

      <div className="grid gap-5 md:gap-6 xl:grid-cols-3">
        {/* Enrolled Courses - Primary */}
        <motion.div variants={item} className="xl:col-span-2 card-elevated ui-card-pad">
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
              <EmptyState
                className="col-span-2"
                title="No active enrollments"
                description="Enroll in a course to see your course cards here."
                actionLabel="Browse courses"
                onAction={() => navigate(orgSlug ? `/${orgSlug}/courses` : '/courses')}
              />
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
        <motion.div variants={item} className="card-elevated ui-card-pad">
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
              <EmptyState
                title="No classes scheduled"
                description="You’re all clear for this day."
              />
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

      </div>

      {/* Quick Actions */}

      
      {/* Analytics Section (New) */}
      <motion.div variants={item} className="grid gap-6 lg:grid-cols-2">
         {/* Grades History */}
         <div 
          className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
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
              <EmptyState title="No grade history" description="Your grade trend will appear once results are published." />
            )}
         </div>
         
         {/* Attendance Overview (Quick Graph) */}
         <div 
          className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
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
              setStats((prev) => ({
                ...prev,
                attendancePercentage: Math.min(100, prev.attendancePercentage + 1),
              }));
              setShowQRScanner(false);
              // Refresh attendance data
              void fetchStudentStats();
            }}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
