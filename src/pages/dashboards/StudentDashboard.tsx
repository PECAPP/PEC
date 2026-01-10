import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BookOpen,
  ClipboardCheck,
  CreditCard,
  FileText,
  Briefcase,
  TrendingUp,
  Clock,
  AlertTriangle,
  Calendar,
  CheckCircle,
  ArrowUpRight,
  Loader2,
  Camera,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
import QRAttendanceScanner from '@/components/attendance/QRAttendanceScanner';

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

export function StudentDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [stats, setStats] = useState({
    attendancePercentage: 0,
    cgpa: 0,
    enrolledCourses: 0,
    pendingAssignments: 0,
  });
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [upcomingAssignments, setUpcomingAssignments] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<any[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/auth');
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        const userInfo = userDoc.data();
        setUserData(userInfo);

        if (userInfo?.role === 'student') {
          const profileDoc = await getDoc(doc(db, 'studentProfiles', user.uid));
          const pData = profileDoc.data();
          setProfileData(pData);

          // Fetch real stats
          await fetchStudentStats(user.uid, pData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const fetchStudentStats = async (userId: string, pData?: any) => {
    try {
      // Fetch enrollments
      const enrollmentsQuery = query(
        collection(db, 'enrollments'),
        where('studentId', '==', userId),
        where('status', '==', 'active')
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrolledCourseIds = enrollmentsSnapshot.docs.map(doc => doc.data().courseId);
      const enrolledCount = enrolledCourseIds.length;

      // Fetch course details for list
      const courseDetails = await Promise.all(
        enrolledCourseIds.map(async (id) => {
          const courseDoc = await getDoc(doc(db, 'courses', id));
          return { id, ...courseDoc.data() };
        })
      );
      setEnrolledCoursesList(courseDetails);

      // Fetch attendance
      const attendanceQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', userId)
      );
      const attendanceSnapshot = await getDocs(attendanceQuery);
      const attendanceRecords = attendanceSnapshot.docs.map(doc => doc.data());
      const present = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
      const total = attendanceRecords.length;
      const attendancePercentage = total > 0 ? Math.round((present / total) * 100) : 0;

      // Fetch grades and calculate CGPA
      const gradesQuery = query(
        collection(db, 'grades'),
        where('studentId', '==', userId)
      );
      const gradesSnapshot = await getDocs(gradesQuery);
      const grades = gradesSnapshot.docs.map(doc => doc.data());
      
      let totalGradePoints = 0;
      let totalCredits = 0;
      
      for (const grade of grades) {
        let credits = grade.credits || 0;
        
        // Only fetch course data if credits are missing and courseId exists
        if (!credits && grade.courseId) {
          try {
            const courseData = (courseDetails.find(c => c.id === grade.courseId) || 
                               (await getDoc(doc(db, 'courses', grade.courseId))).data()) as any;
            credits = courseData?.credits || 0;
          } catch (e) {
            console.error('Error fetching course data for grade:', grade.courseId, e);
          }
        }
        
        totalGradePoints += (grade.gradePoints || 0) * credits;
        totalCredits += credits;
      }
      
      const cgpa = totalCredits > 0 ? Math.round((totalGradePoints / totalCredits) * 100) / 100 : 0;

      // Fetch assignments
      const assignmentsQuery = query(collection(db, 'assignments'));
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const allAssignments = assignmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Filter for enrolled courses
      const myAssignments = allAssignments.filter((a: any) => enrolledCourseIds.includes(a.courseId));
      
      // Get submissions
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('studentId', '==', userId)
      );
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const submittedIds = submissionsSnapshot.docs.map(doc => doc.data().assignmentId);
      
      const pending = myAssignments.filter((a: any) => !submittedIds.includes(a.id));
      const pendingCount = pending.length;
      
      // Sort by due date and get top 3
      const upcoming = pending
        .sort((a: any, b: any) => {
          const dateA = a.dueDate?.toDate?.() || new Date(a.dueDate);
          const dateB = b.dueDate?.toDate?.() || new Date(b.dueDate);
          return dateA.getTime() - dateB.getTime();
        })
        .slice(0, 3);
      
      // Add course names to assignments
      const upcomingWithCourses = upcoming.map((assignment: any) => {
        const courseData = courseDetails.find(c => c.id === assignment.courseId) as any;
        return {
          ...assignment,
          courseCode: courseData?.code || 'N/A',
          courseName: courseData?.name || 'Unknown',
        };
      });

      // Fetch applications
      const appsQuery = query(
        collection(db, 'applications'),
        where('studentId', '==', userId)
      );
      const appsSnapshot = await getDocs(appsQuery);
      setApplications(appsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

      // Fetch today's schedule from centralized timetable
      if (pData?.department && pData?.semester) {
        const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
        const timetableQuery = query(
          collection(db, 'timetable'),
          where('department', '==', pData.department),
          where('semester', '==', pData.semester)
        );
        const timetableSnapshot = await getDocs(timetableQuery);
        const todaySchedule = timetableSnapshot.docs
          .map(doc => doc.data())
          .filter((item: any) => item.day === today)
          .map((item: any) => ({
            ...item,
            startTime: item.timeSlot?.split('-')[0] || '09:00',
            endTime: item.timeSlot?.split('-')[1] || '10:00',
          }));
        
        todaySchedule.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
        setTodayClasses(todaySchedule);
      }

      setStats({
        attendancePercentage,
        cgpa,
        enrolledCourses: enrolledCount,
        pendingAssignments: pendingCount,
      });
      setUpcomingAssignments(upcomingWithCourses);

    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const firstName = userData?.fullName?.split(' ')[0] || 'Student';

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
        <motion.div variants={item} className="card-elevated p-5">
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

        <motion.div variants={item} className="card-elevated p-5">
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

        <motion.div variants={item} className="card-elevated p-5">
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

        <motion.div variants={item} className="card-elevated p-5">
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/courses')}>
              View All
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {enrolledCoursesList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8 col-span-2">No active enrollments</p>
            ) : (
              enrolledCoursesList.map((course, idx) => (
                <div key={idx} className="p-4 rounded-xl border border-border hover:bg-primary transition-all group cursor-pointer">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-bold text-foreground group-hover:text-primary-foreground mb-1">{course.code}</p>
                      <p className="font-semibold text-foreground group-hover:text-primary-foreground transition-colors line-clamp-1">{course.name}</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center justify-between text-[10px] text-muted-foreground group-hover:text-primary-foreground/80 font-medium uppercase tracking-wider transition-colors">
                    <span>{course.credits} Credits</span>
                    <Badge variant="secondary" className="text-[9px] px-1.5 py-0 group-hover:bg-primary-foreground group-hover:text-primary border-none">Semester {course.semester}</Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Today's Schedule */}
        <motion.div variants={item} className="card-elevated p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Today's Schedule
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/timetable')}>
              Full
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {todayClasses.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No classes today</p>
            ) : (
              todayClasses.map((cls, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border bg-secondary/10">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-foreground">{cls.courseCode}</span>
                    <Badge variant="outline" className="text-[10px] bg-background">{cls.startTime} - {cls.endTime}</Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground font-medium mt-1 uppercase">{cls.room}</p>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/placement')}>
              Browse
              <ArrowUpRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {applications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No active applications</p>
            ) : (
              applications.map((app) => (
                <div key={app.id} className="p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground line-clamp-1">{app.jobTitle}</span>
                    <Badge variant={app.status === 'offered' ? 'success' : app.status === 'rejected' ? 'destructive' : 'secondary'} className="text-[9px] capitalize">
                      {app.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{app.companyName}</p>
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
            <Button variant="ghost" size="sm" onClick={() => navigate('/assignments')}>
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
                    <div key={assignment.id} className="p-3 rounded-xl border border-border group hover:border-warning/30 transition-colors">
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
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Button variant="outline" className="h-20" onClick={() => navigate('/courses')}>
          <div className="flex flex-col items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="text-sm">My Courses</span>
          </div>
        </Button>
        <Button variant="outline" className="h-20" onClick={() => navigate('/attendance')}>
          <div className="flex flex-col items-center gap-2">
            <ClipboardCheck className="w-5 h-5" />
            <span className="text-sm">Attendance</span>
          </div>
        </Button>
        <Button variant="outline" className="h-20" onClick={() => navigate('/examinations')}>
          <div className="flex flex-col items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Grades</span>
          </div>
        </Button>
        <Button variant="outline" className="h-20" onClick={() => navigate('/assignments')}>
          <div className="flex flex-col items-center gap-2">
            <FileText className="w-5 h-5" />
            <span className="text-sm">Assignments</span>
          </div>
        </Button>
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
              if (userData) {
                fetchStudentStats(userData.uid, profileData);
              }
            }}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
