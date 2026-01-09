import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

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
              <BarChart3 className="w-4 h-4" />
              Reports
            </Button>
          </Link>
          <Link to="/users/add">
            <Button variant="gradient">
              <Users className="w-4 h-4" />
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
          value="8,420"
          subtext="Active enrollment"
          trend="+156 this semester"
          trendUp
        />
        <StatCard
          icon={Users}
          label="Faculty Members"
          value="342"
          subtext="Across departments"
        />
        <StatCard
          icon={BookOpen}
          label="Active Courses"
          value="186"
          subtext="This semester"
        />
        <StatCard
          icon={CreditCard}
          label="Fee Collection"
          value="₹4.2Cr"
          subtext="This quarter"
          trend="+8.3%"
          trendUp
          iconColor="text-success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Overview */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Department Overview</h2>
              <Link to="/departments">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <DepartmentRow
                name="Computer Science & Engineering"
                students={1850}
                faculty={48}
                attendance={86}
              />
              <DepartmentRow
                name="Electronics & Communication"
                students={1420}
                faculty={38}
                attendance={82}
              />
              <DepartmentRow
                name="Mechanical Engineering"
                students={1180}
                faculty={35}
                attendance={79}
              />
              <DepartmentRow
                name="Civil Engineering"
                students={920}
                faculty={28}
                attendance={84}
              />
            </div>
          </motion.div>

          {/* Fee Analytics */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Fee Collection Status</h2>
              <Link to="/financial-report">
                <Button variant="ghost" size="sm">
                  Financial Report
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 rounded-lg bg-success/10">
                <p className="text-2xl font-bold text-success">78%</p>
                <p className="text-sm text-muted-foreground">Collected</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/10">
                <p className="text-2xl font-bold text-warning">15%</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-destructive/10">
                <p className="text-2xl font-bold text-destructive">7%</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Collection Progress</span>
                <span className="font-medium">₹4.2Cr / ₹5.4Cr</span>
              </div>
              <Progress value={78} className="h-2" />
            </div>
          </motion.div>

          {/* Recent Admissions */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Admissions</h2>
              <Link to="/admissions">
                <Button variant="ghost" size="sm">
                  View All
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
            <div className="space-y-3">
              <AdmissionRow
                name="Priya Sharma"
                department="Computer Science"
                date="Dec 28, 2024"
                status="approved"
              />
              <AdmissionRow
                name="Rahul Verma"
                department="Electronics"
                date="Dec 27, 2024"
                status="pending"
              />
              <AdmissionRow
                name="Ananya Singh"
                department="Mechanical"
                date="Dec 26, 2024"
                status="approved"
              />
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Alerts */}
          <motion.div variants={item} className="p-4 rounded-xl bg-warning/10 border border-warning/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
              <div>
                <h3 className="font-medium text-foreground">Action Required</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  12 faculty leave requests pending approval
                </p>
              </div>
            </div>
          </motion.div>

          {/* Attendance Summary */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Attendance Summary</h2>
            <div className="space-y-4">
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-secondary"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="48"
                      cy="48"
                      r="40"
                      className="stroke-accent"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray={`${83 * 2.51} 251`}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">
                    83%
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-2">Average Attendance</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Present Today</span>
                  <span className="font-medium text-success">7,245</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Absent Today</span>
                  <span className="font-medium text-destructive">1,175</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">On Leave</span>
                  <span className="font-medium text-warning">320</span>
                </div>
              </div>
            </div>
          </motion.div>

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

          {/* Quick Actions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-2">
              <Link to="/faculty/add">
                <Button variant="outline" size="sm" className="justify-start w-full">
                  <Users className="w-4 h-4" />
                  Add Faculty
                </Button>
              </Link>
              <Link to="/courses/add">
                <Button variant="outline" size="sm" className="justify-start w-full">
                  <BookOpen className="w-4 h-4" />
                  New Course
                </Button>
              </Link>
              <Link to="/college-schedule">
                <Button variant="outline" size="sm" className="justify-start w-full">
                  <Calendar className="w-4 h-4" />
                  Schedule
                </Button>
              </Link>
              <Link to="/fee-setup">
                <Button variant="outline" size="sm" className="justify-start w-full">
                  <CreditCard className="w-4 h-4" />
                  Fee Setup
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
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
        <div className={`w-2 h-8 rounded-full ${attendance >= 80 ? 'bg-success' : attendance >= 75 ? 'bg-warning' : 'bg-destructive'}`} />
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
    approved: 'status-verified',
    pending: 'status-pending',
    rejected: 'status-error',
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
      <span className={`status-badge ${statusColors[status]}`}>
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
    exam: 'bg-destructive/10 text-destructive',
    event: 'bg-accent/10 text-accent',
    placement: 'bg-success/10 text-success',
  };

  return (
    <div className="flex items-center gap-3 p-2">
      <div className={`w-2 h-2 rounded-full ${type === 'exam' ? 'bg-destructive' : type === 'event' ? 'bg-accent' : 'bg-success'}`} />
      <div className="flex-1">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground">{date}</p>
      </div>
    </div>
  );
}

export default CollegeAdminDashboard;
