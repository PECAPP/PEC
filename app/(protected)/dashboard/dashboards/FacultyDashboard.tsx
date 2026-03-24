import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

import {
  BookOpen,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle,
  GraduationCap,
  BarChart3,
  QrCode,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import QRAttendanceGenerator from '@/components/attendance/QRAttendanceGenerator';
import FacultyScheduleManager from '@/components/timetable/FacultyScheduleManager';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

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

export function FacultyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeCount: 0, studentCount: 0 });

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'faculty') {
      router.replace('/auth');
      return;
    }

    void (async () => {
      try {
        type ApiResponse<T> = { success: boolean; data: T; meta?: any };

        const [coursesRes, enrollmentsRes] = await Promise.all([
          api.get<ApiResponse<any>>('/courses', { params: { limit: 200, offset: 0 } }),
          api.get<ApiResponse<any>>('/enrollments', { params: { limit: 200, offset: 0 } }),
        ]);

        const allCourses = coursesRes.data.data || [];
        const allEnrollments = enrollmentsRes.data.data || [];

        // Filter courses by instructor name
        const facultyCourses = allCourses.filter((c: any) => 
          c.instructor && user.fullName && c.instructor.toLowerCase().includes(user.fullName.toLowerCase())
        );

        setCourses(facultyCourses);

        const uniqueStudents = new Set(
          allEnrollments
            .filter((e: any) => facultyCourses.some((c: any) => c.id === e.courseId))
            .map((e: any) => e.studentId)
        );

        setStats({
          activeCount: facultyCourses.length,
          studentCount: uniqueStudents.size,
        });

        if (facultyCourses.length > 0) {
          setSelectedCourse(facultyCourses[0]);
        }
      } catch (error) {
        console.error('Error fetching faculty data:', error);
        toast.error('Failed to load courses');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, router]);

  const handleGenerateQR = () => {
    if (!selectedCourse) {
      // Show course selection first
      return;
    }
    setShowQRModal(true);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Faculty Dashboard</h1>
          <p className="text-muted-foreground">Manage your courses, students, and academic activities</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowScheduleManager(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Class
          </Button>
          <Select value={selectedCourse?.id} onValueChange={(value) => setSelectedCourse(courses.find(c => c.id === value))}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.code} - {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="gradient" 
            onClick={handleGenerateQR}
            disabled={!selectedCourse}
          >
            <QrCode className="w-4 h-4 mr-2" />
            Generate QR
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value={String(stats.activeCount)}
          subtext="This semester"
        />
        <StatCard
          icon={Users}
          label="Total Students"
          value={String(stats.studentCount)}
          subtext="Across all courses"
        />
        <StatCard
          icon={ClipboardCheck}
          label="Avg Attendance"
          value="84%"
          subtext="This month"
          iconColor="text-success"
        />
        <StatCard
          icon={FileText}
          label="Pending Reviews"
          value="18"
          subtext="Assignments to grade"
          iconColor="text-warning"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Schedule */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Today's Schedule</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/timetable')}>
                Full Timetable
                <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
            <div className="space-y-3">
              <ScheduleItem
                time="09:00 - 10:30"
                course="Data Structures & Algorithms"
                section="CSE-A"
                room="Room 204"
                students={62}
                status="completed"
              />
              <ScheduleItem
                time="11:00 - 12:30"
                course="Database Management Systems"
                section="CSE-B"
                room="Lab 3"
                students={58}
                status="ongoing"
              />
              <ScheduleItem
                time="14:00 - 15:30"
                course="Data Structures & Algorithms"
                section="CSE-C"
                room="Room 301"
                students={65}
                status="upcoming"
              />
              <ScheduleItem
                time="16:00 - 17:00"
                course="DBMS Lab"
                section="CSE-A"
                room="Lab 2"
                students={30}
                status="upcoming"
              />
            </div>
          </motion.div>

          {/* My Courses */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">My Courses</h2>
              <Button variant="ghost" size="sm" onClick={() => router.push('/courses')}>
                Manage
                <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CourseCard
                code="CS201"
                name="Data Structures & Algorithms"
                students={187}
                progress={65}
                avgAttendance={86}
              />
              <CourseCard
                code="CS301"
                name="Database Management Systems"
                students={116}
                progress={58}
                avgAttendance={82}
              />
              <CourseCard
                code="CS401"
                name="Machine Learning"
                students={94}
                progress={42}
                avgAttendance={78}
              />
              <CourseCard
                code="CS202"
                name="Object Oriented Programming"
                students={148}
                progress={70}
                avgAttendance={84}
              />
            </div>
          </motion.div>

          {/* Recent Submissions */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Submissions</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              <SubmissionRow
                title="DSA Assignment 3 - Binary Trees"
                course="CS201"
                submitted={58}
                total={62}
                deadline="Dec 26"
              />
              <SubmissionRow
                title="DBMS Lab Report - Normalization"
                course="CS301"
                submitted={42}
                total={58}
                deadline="Dec 28"
              />
              <SubmissionRow
                title="ML Mini Project - Classification"
                course="CS401"
                submitted={35}
                total={94}
                deadline="Jan 2"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <motion.div variants={item} className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Low Attendance Alert</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  8 students in CS201 are below 75% attendance threshold
                </p>
                <Button variant="link" size="sm" className="px-0 mt-1 h-auto">
                  View Students →
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push('/attendance')}>
                <ClipboardCheck className="w-4 h-4 mr-2" />
                Mark Attendance
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push('/assignments')}>
                <FileText className="w-4 h-4 mr-2" />
                Create Assignment
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push('/examinations')}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Upload Grades
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" onClick={() => router.push('/examinations')}>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Test
              </Button>
            </div>
          </motion.div>

          {/* Upcoming Deadlines */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Deadlines</h2>
            <div className="space-y-3">
              <DeadlineItem
                title="Mid-Semester Grades"
                course="All Courses"
                dueDate="Jan 5"
                daysLeft={7}
              />
              <DeadlineItem
                title="DSA Internal Assessment"
                course="CS201"
                dueDate="Jan 10"
                daysLeft={12}
              />
              <DeadlineItem
                title="DBMS Project Evaluation"
                course="CS301"
                dueDate="Jan 15"
                daysLeft={17}
              />
            </div>
          </motion.div>

          {/* Student Performance */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Class Performance</h2>
            <div className="space-y-4">
            <div className="h-[200px] w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={[
                   { name: 'Excellent', count: 42, color: '#22c55e' },
                   { name: 'Good', count: 128, color: '#3b82f6' },
                   { name: 'Average', count: 58, color: '#f59e0b' },
                   { name: 'Poor', count: 17, color: '#ef4444' },
                 ]}>
                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                   <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                   <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                   <Tooltip 
                     cursor={{ fill: 'hsl(var(--accent)/0.1)' }}
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                   />
                   <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                     {
                        [
                          { name: 'Excellent', count: 42, color: '#22c55e' },
                          { name: 'Good', count: 128, color: '#3b82f6' },
                          { name: 'Average', count: 58, color: '#f59e0b' },
                          { name: 'Poor', count: 17, color: '#ef4444' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))
                     }
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* QR Attendance Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Attendance</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <QRAttendanceGenerator
              courseId={selectedCourse.id}
              courseName={`${selectedCourse.code} - ${selectedCourse.name}`}
              onClose={() => setShowQRModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Manager Modal */}
      <Dialog open={showScheduleManager} onOpenChange={setShowScheduleManager}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Schedule</DialogTitle>
          </DialogHeader>
          <FacultyScheduleManager
            courses={courses}
            onScheduleAdded={() => {
              setShowScheduleManager(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext: string;
  trend?: string;
  trendUp?: boolean;
  iconColor?: string;
}

function StatCard({ icon: Icon, label, value, subtext, trend, trendUp, iconColor = 'text-primary' }: StatCardProps) {
  return (
    <div className="card-elevated p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-secondary flex items-center justify-center ${iconColor}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-medium ${trendUp ? 'text-success' : 'text-destructive'}`}>
            {trend}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-foreground">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </div>
  );
}

interface ScheduleItemProps {
  time: string;
  course: string;
  section: string;
  room: string;
  students: number;
  status: 'completed' | 'ongoing' | 'upcoming';
}

function ScheduleItem({ time, course, section, room, students, status }: ScheduleItemProps) {
  const statusStyles = {
    completed: 'bg-muted text-muted-foreground',
    ongoing: 'bg-accent/10 border-accent/30 text-foreground',
    upcoming: 'bg-card text-foreground',
  };

  return (
    <div className={`p-3 rounded-lg border ${statusStyles[status]} flex items-center gap-4`}>
      <div className="flex items-center gap-2 w-28 shrink-0">
        <Clock className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">{time}</span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{course}</p>
        <p className="text-sm text-muted-foreground">{section} · {room} · {students} students</p>
      </div>
      {status === 'completed' && <CheckCircle className="w-4 h-4 text-success shrink-0" />}
      {status === 'ongoing' && <span className="px-2 py-0.5 text-xs font-medium bg-accent text-accent-foreground rounded-full">Live</span>}
    </div>
  );
}

interface CourseCardProps {
  code: string;
  name: string;
  students: number;
  progress: number;
  avgAttendance: number;
}

function CourseCard({ code, name, students, progress, avgAttendance }: CourseCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-xs font-medium text-accent">{code}</span>
          <p className="font-semibold text-foreground">{name}</p>
        </div>
        <div className="flex items-center gap-1 text-sm text-muted-foreground">
          <Users className="w-3.5 h-3.5" />
          {students}
        </div>
      </div>
      <div className="space-y-2 mt-3">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Syllabus</span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5" />
      </div>
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-border">
        <span className="text-xs text-muted-foreground">Attendance</span>
        <span className={`text-sm font-medium ${avgAttendance >= 80 ? 'text-success' : avgAttendance >= 75 ? 'text-warning' : 'text-destructive'}`}>
          {avgAttendance}%
        </span>
      </div>
    </div>
  );
}

interface SubmissionRowProps {
  title: string;
  course: string;
  submitted: number;
  total: number;
  deadline: string;
}

function SubmissionRow({ title, course, submitted, total, deadline }: SubmissionRowProps) {
  const percentage = (submitted / total) * 100;
  
  return (
    <div className="p-3 rounded-lg border border-border">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-medium text-foreground text-sm">{title}</p>
          <p className="text-xs text-muted-foreground">{course} · Due {deadline}</p>
        </div>
        <span className="text-sm font-medium">{submitted}/{total}</span>
      </div>
      <Progress value={percentage} className="h-1.5" />
    </div>
  );
}

interface DeadlineItemProps {
  title: string;
  course: string;
  dueDate: string;
  daysLeft: number;
}

function DeadlineItem({ title, course, dueDate, daysLeft }: DeadlineItemProps) {
  const urgency = daysLeft <= 3 ? 'text-destructive' : daysLeft <= 7 ? 'text-warning' : 'text-muted-foreground';
  
  return (
    <div className="flex items-center gap-3">
      <div className={`w-8 h-8 rounded-lg bg-secondary flex items-center justify-center ${urgency}`}>
        <Calendar className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{title}</p>
        <p className="text-xs text-muted-foreground">{course}</p>
      </div>
      <div className="text-right">
        <p className={`text-sm font-medium ${urgency}`}>{daysLeft}d</p>
        <p className="text-xs text-muted-foreground">{dueDate}</p>
      </div>
    </div>
  );
}

export default FacultyDashboard;
