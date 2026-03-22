import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  GraduationCap,
  BookOpen,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  Building2,
  UserCheck,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';

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

export function CollegeAdminDashboard() {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAdmin } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalFaculty: 0,
    activeCourses: 0,
    feeCollection: 0,
    studentsDiff: 0,
    feeDiff: 0,
  });
  const [departments, setDepartments] = useState<any[]>([]);
  const [recentAdmissions, setRecentAdmissions] = useState<any[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }

    if (!isAdmin) {
      toast.error('Access denied');
      navigate('/dashboard', { replace: true });
      return;
    }

    void fetchDashboardData();
  }, [authLoading, user, isAdmin, navigate]);

  const fetchDashboardData = async () => {
    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: { total?: number } };
      const [usersResponse, coursesResponse] = await Promise.all([
        api.get<ApiResponse<any[]>>('/users', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any[]>>('/courses', { params: { limit: 200, offset: 0 } }),
      ]);

      const users = usersResponse.data.data || [];
      const studentCount = users.filter(u => u.role === 'student').length;
      const facultyCount = users.filter(u => u.role === 'faculty').length;

      const coursesCount = coursesResponse.data.meta?.total ?? (coursesResponse.data.data || []).length;
      const totalCollected = 0;

      setStats({
        totalStudents: studentCount,
        totalFaculty: facultyCount,
        activeCourses: coursesCount,
        feeCollection: totalCollected,
        studentsDiff: 12, // Mock for now or calculate if history exists
        feeDiff: 5.4,     // Mock for now
      });

      // 4. Process Departments (Mocking active counts based on courses for now if no dedicated collection)
      // Or aggregate from users/courses
      const deptMap: Record<string, { students: number, faculty: number }> = {};
      users.forEach(u => {
        if (u.department) {
            if (!deptMap[u.department]) deptMap[u.department] = { students: 0, faculty: 0 };
            if (u.role === 'student') deptMap[u.department].students++;
            if (u.role === 'faculty') deptMap[u.department].faculty++;
        }
      });
      
      const deptList = Object.entries(deptMap).map(([name, data]) => ({
        name,
        students: data.students,
        faculty: data.faculty,
        attendance: Math.floor(Math.random() * (95 - 75) + 75) // Mock attendance for now
      }));
      setDepartments(deptList);

      // 5. Recent Admissions (Newest students)
      const recentStudents = users
        .filter(u => u.role === 'student')
        .slice(0, 5);
      
      setRecentAdmissions(recentStudents);

    } catch (e) {
      console.error("Fetch error:", e);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`;
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
    return `₹${amount.toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
          <h1 className="text-2xl font-bold text-foreground">Institution Dashboard</h1>
          <p className="text-muted-foreground">Manage your college operations and analytics</p>
        </div>
        <div className="flex gap-2">
          <Link to="/reports">
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link to="/users/add">
            <Button>
              <Users className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={GraduationCap}
          label="Total Students"
          value={stats.totalStudents.toLocaleString()}
          subtext="Active enrollment"
          trend={`+${stats.studentsDiff} this month`}
          trendUp={true}
        />
        <StatCard
          icon={Users}
          label="Faculty Members"
          value={stats.totalFaculty.toLocaleString()}
          subtext="Across departments"
        />
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value={stats.activeCourses.toLocaleString()}
          subtext="This semester"
        />
        <StatCard
          icon={CreditCard}
          label="Fee Collection"
          value={formatCurrency(stats.feeCollection)}
          subtext="Total Collected"
          trend={`+${stats.feeDiff}%`}
          trendUp={true}
          iconColor="text-success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <Tabs defaultValue="courses" className="space-y-6">
        <div className="flex overflow-x-auto pb-2">
            <TabsList>
                <TabsTrigger value="courses">Courses</TabsTrigger>
                <TabsTrigger value="users">Users</TabsTrigger>
                <TabsTrigger value="fees">Fees</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
        </div>

        {/* COURSES TAB */}
        <TabsContent value="courses" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Department Overview */}
                    <motion.div variants={item} className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Department Overview</h2>
                        <Link to="/departments">
                            <Button variant="ghost" size="sm">
                            View All
                            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </Link>
                        </div>
                        <div className="space-y-3">
                            {departments.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No department data available.</p>
                            ) : (
                                departments.slice(0, 5).map((dept, idx) => (
                                    <DepartmentRow
                                        key={idx}
                                        name={dept.name}
                                        students={dept.students}
                                        faculty={dept.faculty}
                                        attendance={dept.attendance}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                </div>
                <div className="space-y-6">
                     <motion.div variants={item} className="card-elevated p-6">
                         <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                         <Link to="/courses/add">
                             <Button variant="outline" size="sm" className="justify-start w-full">
                                 <BookOpen className="w-4 h-4 mr-2" />
                                 New Course
                             </Button>
                         </Link>
                         <Link to="/timetable" className="mt-2 block">
                             <Button variant="outline" size="sm" className="justify-start w-full">
                                 <Calendar className="w-4 h-4 mr-2" />
                                 Schedule
                             </Button>
                         </Link>
                     </motion.div>
                </div>
            </div>
        </TabsContent>

        {/* USERS TAB */}
        <TabsContent value="users" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                    {/* Recent Admissions */}
                    <motion.div variants={item} className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Recent Admissions</h2>
                        <Link to="/users">
                            <Button variant="ghost" size="sm">
                            View All
                            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </Link>
                        </div>
                        <div className="space-y-3">
                            {recentAdmissions.length === 0 ? (
                                <p className="text-sm text-muted-foreground text-center py-4">No recent admissions.</p>
                            ) : (
                                recentAdmissions.map((student) => (
                                    <AdmissionRow
                                        key={student.id}
                                        name={student.fullName}
                                        department={student.department || 'N/A'}
                                      date={student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                                        status={student.status === 'active' ? 'approved' : 'pending'}
                                    />
                                ))
                            )}
                        </div>
                    </motion.div>
                 </div>
                 <div className="space-y-6">
                    <motion.div variants={item} className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                        <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                        <div>
                            <h3 className="font-medium text-foreground">Action Required</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                            Pending profile approvals
                            </p>
                            <Link to="/users?filter=pending">
                                <Button size="sm" variant="link" className="px-0 h-auto mt-2 text-orange-600">Review</Button>
                            </Link>
                        </div>
                        </div>
                    </motion.div>
                    <motion.div variants={item} className="card-elevated p-6">
                         <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                         <Link to="/users/add">
                             <Button variant="outline" size="sm" className="justify-start w-full">
                                 <Users className="w-4 h-4 mr-2" />
                                 Add Faculty
                             </Button>
                         </Link>
                     </motion.div>
                 </div>
             </div>
        </TabsContent>

        {/* FEES TAB */}
        <TabsContent value="fees" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 space-y-6">
                      {/* Fee Analytics */}
                      <motion.div variants={item} className="card-elevated p-6">
                        <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-foreground">Fee Collection Status</h2>
                        <Link to="/finance">
                            <Button variant="ghost" size="sm">
                            Financial Report
                            <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                            </Button>
                        </Link>
                        </div>
                        <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="text-center p-4 rounded-lg bg-green-500/10">
                            <p className="text-2xl font-bold text-green-600">78%</p>
                            <p className="text-sm text-muted-foreground">Collected</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-yellow-500/10">
                            <p className="text-2xl font-bold text-yellow-600">15%</p>
                            <p className="text-sm text-muted-foreground">Pending</p>
                        </div>
                        <div className="text-center p-4 rounded-lg bg-red-500/10">
                            <p className="text-2xl font-bold text-red-600">7%</p>
                            <p className="text-sm text-muted-foreground">Overdue</p>
                        </div>
                        </div>
                        <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Collection Progress</span>
                            <span className="font-medium">{formatCurrency(stats.feeCollection)} / {formatCurrency(stats.feeCollection * 1.3)}</span>
                        </div>
                        <Progress value={78} className="h-2" />
                        </div>
                    </motion.div>
                 </div>
                 <div className="space-y-6">
                     <motion.div variants={item} className="card-elevated p-6">
                         <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
                         <Link to="/finance">
                             <Button variant="outline" size="sm" className="justify-start w-full">
                                 <CreditCard className="w-4 h-4 mr-2" />
                                 Fee Setup
                             </Button>
                         </Link>
                     </motion.div>
                 </div>
            </div>
        </TabsContent>

        {/* ANALYTICS TAB */}
        <TabsContent value="analytics" className="space-y-6">
             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2">
                    {/* Attendance Summary */}
                    <motion.div variants={item} className="card-elevated p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Attendance Summary</h2>
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="text-center">
                                <div className="relative w-32 h-32 mx-auto">
                                <svg className="w-32 h-32 transform -rotate-90">
                                    <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    className="stroke-muted"
                                    strokeWidth="12"
                                    fill="none"
                                    />
                                    <circle
                                    cx="64"
                                    cy="64"
                                    r="56"
                                    className="stroke-primary"
                                    strokeWidth="12"
                                    fill="none"
                                    strokeDasharray={`${83 * 3.51} 351`}
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-3xl font-bold">
                                    83%
                                </span>
                                </div>
                                <p className="text-sm text-muted-foreground mt-2">Overall Average</p>
                            </div>
                            <div className="flex-1 w-full space-y-4">
                                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                                    <span className="text-muted-foreground">Present Today</span>
                                    <span className="font-bold text-green-600 text-lg">7,245</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                                    <span className="text-muted-foreground">Absent Today</span>
                                    <span className="font-bold text-red-600 text-lg">1,175</span>
                                </div>
                                <div className="flex justify-between items-center p-3 bg-secondary/30 rounded-lg">
                                    <span className="text-muted-foreground">On Leave</span>
                                    <span className="font-bold text-yellow-600 text-lg">320</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                 </div>
                 <div>
                    {/* Upcoming Events */}
                    <motion.div variants={item} className="card-elevated p-6">
                        <h2 className="text-lg font-semibold text-foreground mb-4">Upcoming Events</h2>
                        <div className="space-y-3">
                        <EventItem
                            title="Semester Exams Begin"
                            date="Jan 10, 2025"
                            type="exam"
                        />
                        <EventItem
                            title="Annual Day Celebration"
                            date="Jan 26, 2025"
                            type="event"
                        />
                        <EventItem
                            title="Placement Drive - TCS"
                            date="Feb 5, 2025"
                            type="placement"
                        />
                        </div>
                    </motion.div>
                 </div>
             </div>
        </TabsContent>
      </Tabs>
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
          <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
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

interface DepartmentRowProps {
  name: string;
  students: number;
  faculty: number;
  attendance: number;
}

function DepartmentRow({ name, students, faculty, attendance }: DepartmentRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-colors">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-foreground truncate">{name}</p>
        <p className="text-sm text-muted-foreground">{students} students · {faculty} faculty</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{attendance}%</p>
          <p className="text-xs text-muted-foreground">Attendance</p>
        </div>
        <div className={`w-2 h-8 rounded-full ${attendance >= 80 ? 'bg-green-500' : attendance >= 75 ? 'bg-yellow-500' : 'bg-red-500'}`} />
      </div>
    </div>
  );
}

interface AdmissionRowProps {
  name: string;
  department: string;
  date: string;
  status: 'approved' | 'pending' | 'rejected';
}

function AdmissionRow({ name, department, date, status }: AdmissionRowProps) {
  const statusColors = {
    approved: 'bg-green-500/10 text-green-600 border border-green-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border border-yellow-500/20',
    rejected: 'bg-red-500/10 text-red-600 border border-red-500/20',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-secondary/30">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <UserCheck className="w-4 h-4 text-primary" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{department} · {date}</p>
        </div>
      </div>
      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    </div>
  );
}

interface EventItemProps {
  title: string;
  date: string;
  type: 'exam' | 'event' | 'placement';
}

function EventItem({ title, date, type }: EventItemProps) {
  const typeColors = {
    exam: 'bg-red-500',
    event: 'bg-blue-500',
    placement: 'bg-green-500',
  };

  return (
    <div className="flex items-center gap-3 p-2">
      <div className={`w-2 h-2 rounded-full ${typeColors[type]}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}
export default CollegeAdminDashboard;
