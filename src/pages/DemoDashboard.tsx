import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  Calendar, 
  CheckCircle, 
  TrendingUp, 
  Clock,
  ArrowUpRight,
  GraduationCap,
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  BarChart3,
  Building
} from 'lucide-react';
import { useState } from 'react';

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

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/demo', active: true },
  { icon: Calendar, label: 'Timetable', path: '/timetable' },
  { icon: BookOpen, label: 'Courses', path: '/courses' },
  { icon: CheckCircle, label: 'Attendance', path: '/attendance' },
  { icon: BarChart3, label: 'Performance', path: '/examinations' },
  { icon: MessageSquare, label: 'Chat', path: '/chat' },
  { icon: Building, label: 'Placements', path: '/placements' },
  { icon: Settings, label: 'Settings', path: '/settings' },
];

export default function DemoDashboard() {
  const [activeTab, setActiveTab] = useState('Dashboard');

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar - Always Visible */}
      <aside className="flex flex-col w-48 md:w-56 lg:w-64 border-r border-white/10 bg-neutral-900 flex-shrink-0">
        <div className="p-4 lg:p-6">
          <h2 className="text-base lg:text-lg font-bold text-white">PEC Demo</h2>
          <p className="text-xs text-neutral-400 mt-1">Student Portal</p>
        </div>
        <nav className="flex-1 px-2 lg:px-3 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveTab(item.label)}
              className={`w-full flex items-center gap-2 lg:gap-3 px-2 lg:px-3 py-2 lg:py-2.5 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                activeTab === item.label
                  ? 'bg-violet-600 text-white'
                  : 'text-neutral-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="w-3.5 h-3.5 lg:w-4 lg:h-4 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-7xl mx-auto"
          >
        {activeTab === 'Dashboard' && (
          <>
        {/* Mock Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <span className="text-lg font-bold text-accent">JD</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Welcome back, John!</h1>
              <p className="text-sm text-neutral-400">Semester 4 • B.Tech Computer Science</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="status-badge status-verified">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Profile
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={TrendingUp}
            label="Current CGPA"
            value="8.92"
            subtext="Top 5% of batch"
            color="text-accent"
          />
          <StatCard
            icon={CheckCircle}
            label="Attendance"
            value="94%"
            subtext="Consistent performer"
            color="text-success"
          />
          <StatCard
            icon={Clock}
            label="Credits Earned"
            value="72/160"
            subtext="On track for graduation"
            color="text-primary"
          />
          <StatCard
            icon={GraduationCap}
            label="Rank"
            value="#12"
            subtext="Out of 120 students"
            color="text-warning"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Schedule */}
            <motion.div variants={item} className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Today's Schedule</h2>
                <button className="text-accent text-sm font-medium hover:underline flex items-center gap-1">
                  View Timetable <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
              <div className="space-y-4">
                <ScheduleItem
                  time="09:00 AM"
                  subject="Advanced Algorithms"
                  room="LT-102"
                  faculty="Dr. Sarah Wilson"
                />
                <ScheduleItem
                  time="11:30 AM"
                  subject="Database Systems"
                  room="Lab 3"
                  faculty="Prof. Mike Ross"
                />
                <ScheduleItem
                  time="02:00 PM"
                  subject="Computer Networks"
                  room="LT-205"
                  faculty="Dr. Alan Turing"
                />
              </div>
            </motion.div>

            {/* Performance Chart Simulation */}
            <motion.div variants={item} className="bg-neutral-900 rounded-xl border border-white/10 p-6 h-[200px] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-accent/5" />
               <div className="relative text-center">
                  <TrendingUp className="w-8 h-8 text-accent mx-auto mb-2 opacity-20" />
                  <p className="text-sm font-medium text-muted-foreground">Interactive Performance Analytics</p>
                  <div className="flex gap-2 mt-4">
                    {[40, 60, 45, 90, 65, 80, 50, 70].map((h, i) => (
                      <motion.div 
                        key={i}
                        initial={{ height: 0 }}
                        animate={{ height: h }}
                        className="w-4 bg-accent/20 rounded-t-sm"
                      />
                    ))}
                  </div>
               </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Recent Notifications */}
            <motion.div variants={item} className="bg-neutral-900 rounded-xl border border-white/10 p-6">
              <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
              <div className="space-y-4">
                <NotificationItem
                  title="Grades Published"
                  desc="Operating Systems Mid-term grades are out."
                  time="2h ago"
                />
                <NotificationItem
                  title="Fee Reminder"
                  desc="Semester 4 tuition fee due next week."
                  time="5h ago"
                />
                <NotificationItem
                  title="Placement Update"
                  desc="Microsoft drive registration starts tomorrow."
                  time="1d ago"
                />
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={item} className="bg-neutral-900 rounded-xl border border-white/10 p-6">
               <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
               <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-secondary rounded-lg text-xs font-semibold hover:bg-secondary/80">Apply Leave</button>
                  <button className="p-3 bg-secondary rounded-lg text-xs font-semibold hover:bg-secondary/80">View Results</button>
                  <button className="p-3 bg-accent text-accent-foreground rounded-lg text-xs font-semibold hover:bg-accent/90">Pay Fees</button>
                  <button className="p-3 bg-secondary rounded-lg text-xs font-semibold hover:bg-secondary/80">Support</button>
               </div>
            </motion.div>
          </div>
        </div>
        </>
        )}

        {activeTab === 'Timetable' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Weekly Timetable</h1>
            <div className="card-elevated p-6">
              <p className="text-muted-foreground">Your weekly schedule will appear here</p>
            </div>
          </div>
        )}

        {activeTab === 'Courses' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">My Courses</h1>
            <div className="grid gap-4">
              {['Data Structures', 'Web Development', 'Database Systems', 'Computer Networks'].map((course, i) => (
                <div key={i} className="card-elevated p-6">
                  <h3 className="font-semibold mb-2">{course}</h3>
                  <p className="text-sm text-muted-foreground">Semester 4 • Core Subject</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Attendance' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Attendance Overview</h1>
            <div className="card-elevated p-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-success mb-2">94%</div>
                <p className="text-muted-foreground">Overall Attendance</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Performance' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Academic Performance</h1>
            <div className="card-elevated p-6">
              <div className="text-center">
                <div className="text-5xl font-bold text-accent mb-2">8.92</div>
                <p className="text-muted-foreground">Current CGPA</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'Chat' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Messages</h1>
            <div className="card-elevated p-6">
              <p className="text-muted-foreground">Start a conversation</p>
            </div>
          </div>
        )}

        {activeTab === 'Placements' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Placement Portal</h1>
            <div className="card-elevated p-6">
              <p className="text-muted-foreground">Upcoming drives and opportunities</p>
            </div>
          </div>
        )}

        {activeTab === 'Settings' && (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>
            <div className="card-elevated p-6">
              <p className="text-muted-foreground">Account preferences</p>
            </div>
          </div>
        )}
      </motion.div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, subtext, color }: any) {
  return (
    <motion.div variants={item} className="bg-neutral-900 rounded-xl border border-white/10 p-5">
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xs text-muted-foreground mt-1">{subtext}</p>
      </div>
    </motion.div>
  );
}

function ScheduleItem({ time, subject, room, faculty }: any) {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors">
      <div className="w-16 text-right">
        <p className="text-sm font-bold">{time.split(' ')[0]}</p>
        <p className="text-[10px] text-muted-foreground">{time.split(' ')[1]}</p>
      </div>
      <div className="w-1 h-10 rounded-full bg-accent/20" />
      <div className="flex-1">
        <p className="font-bold text-sm">{subject}</p>
        <p className="text-xs text-muted-foreground">{faculty} • {room}</p>
      </div>
    </div>
  );
}

function NotificationItem({ title, desc, time }: any) {
  return (
    <div className="flex gap-3">
      <div className="w-2 h-2 rounded-full bg-accent mt-1.5 shrink-0" />
      <div>
        <p className="text-sm font-semibold leading-none mb-1">{title}</p>
        <p className="text-xs text-muted-foreground leading-snug">{desc}</p>
        <p className="text-[10px] text-muted-foreground mt-1">{time}</p>
      </div>
    </div>
  );
}
