import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Building2,
  Users,
  TrendingUp,
  Calendar,
  FileText,
  UserCheck,
  ArrowUpRight,
  CheckCircle,
  Clock,
  Target,
  Award,
  Loader2,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';
import { 
  onSnapshot, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit 
} from '@/lib/dataClient';

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

export function PlacementOfficerDashboard() {
  const [stats, setStats] = useState({
    placed: 0,
    recruiters: 0,
    jobs: 0,
    avgPackage: "₹12.4L",
  });
  const [upcomingDrives, setUpcomingDrives] = useState<any[]>([]);
  const [recentPlacements, setRecentPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Real-time stats
    const unsubJobs = onSnapshot(collection(({} as any), 'jobs'), (snap: any) => {
      setStats(prev => ({ ...prev, jobs: snap.size }));
    });

    const unsubRecruiters = onSnapshot(collection(({} as any), 'recruiter_companies'), (snap: any) => {
      setStats(prev => ({ ...prev, recruiters: snap.size }));
    });

    const unsubApps = onSnapshot(query(collection(({} as any), 'applications'), where('status', '==', 'hired')), (snap: any) => {
      setStats(prev => ({ ...prev, placed: snap.size }));
    });

    // Recent Placements
    const unsubRecent = onSnapshot(
      query(collection(({} as any), 'applications'), where('status', '==', 'hired'), orderBy('updatedAt', 'desc'), limit(4)),
      (snap: any) => {
        setRecentPlacements(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Upcoming Drives
    const unsubDrives = onSnapshot(
      query(collection(({} as any), 'placement_drives'), where('status', '==', 'upcoming'), orderBy('date', 'asc'), limit(4)),
      (snap: any) => {
        setUpcomingDrives(snap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    return () => {
      unsubJobs();
      unsubRecruiters();
      unsubApps();
      unsubRecent();
      unsubDrives();
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
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
          <h1 className="text-2xl font-bold text-foreground">Placement Dashboard</h1>
          <p className="text-muted-foreground">Manage recruiters, drives, and student placements</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button variant="gradient" asChild>
            <Link to="/placements/drives">
              <Plus className="w-4 h-4 mr-2" />
              Schedule Drive
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={UserCheck}
          label="Students Placed"
          value={stats.placed.toString()}
          subtext="Total hires this year"
          trend={`${((stats.placed/1420)*100).toFixed(1)}% rate`}
          trendUp
        />
        <StatCard
          icon={Building2}
          label="Active Recruiters"
          value={stats.recruiters.toString()}
          subtext="Verified partners"
        />
        <StatCard
          icon={Briefcase}
          label="Open Positions"
          value={stats.jobs.toString()}
          subtext="Active job listings"
          iconColor="text-accent"
        />
        <StatCard
          icon={TrendingUp}
          label="Avg Package"
          value={stats.avgPackage}
          subtext="Current batch avg"
          trend="+18% YoY"
          trendUp
          iconColor="text-success"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upcoming Drives */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Upcoming Drives</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/placements/drives">
                  View Calendar
                  <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {upcomingDrives.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No upcoming drives</div>
              ) : (
                upcomingDrives.map(drive => (
                  <DriveCard
                    key={drive.id}
                    company={drive.companyName}
                    role={drive.role}
                    date={drive.date?.toDate ? drive.date.toDate().toLocaleDateString() : new Date(drive.date).toLocaleDateString()}
                    slots={1}
                    registered={drive.registeredCount || 0}
                    status={drive.status === 'upcoming' ? 'confirmed' : 'pending'}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Recent Placements */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recent Placements</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/placements/reports">
                  View All
                  <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="space-y-3">
              {recentPlacements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent placements</div>
              ) : (
                recentPlacements.map(app => (
                  <PlacementRow
                    key={app.id}
                    name={app.studentName}
                    company={app.companyName}
                    role={app.jobTitle}
                    package={"₹12L"}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Company Pipeline */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Recruiter Pipeline</h2>
              <Button variant="ghost" size="sm" asChild>
                 <Link to="/placements/recruiters">
                  Manage
                  <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                </Link>
              </Button>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Contacted', value: 12, color: '#3b82f6' },
                  { name: 'Discussion', value: 8, color: '#f59e0b' },
                  { name: 'Confirmed', value: 5, color: '#8b5cf6' },
                  { name: 'Completed', value: 42, color: '#22c55e' },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <Tooltip 
                     cursor={{ fill: 'hsl(var(--accent)/0.1)' }}
                     contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {
                      [
                        { name: 'Contacted', value: 12, color: '#3b82f6' },
                        { name: 'Discussion', value: 8, color: '#f59e0b' },
                        { name: 'Confirmed', value: 5, color: '#8b5cf6' },
                        { name: 'Completed', value: 42, color: '#22c55e' },
                      ].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))
                    }
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Placement Progress */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Batch Progress</h2>
            <div className="space-y-4">
              <div className="text-center">
              <div className="h-[200px] w-full flex justify-center">
                 <ResponsiveContainer width={200} height={200}>
                   <PieChart>
                     <Pie
                       data={[
                         { name: 'Placed', value: 856, color: '#22c55e' },
                         { name: 'Remaining', value: 564, color: 'hsl(var(--secondary))' },
                       ]}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       startAngle={90}
                       endAngle={-270}
                       dataKey="value"
                     >
                       <Cell fill="#22c55e" />
                       <Cell fill="hsl(var(--secondary))" />
                     </Pie>
                     <Tooltip />
                     <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle">
                       <tspan x="50%" dy="-0.5em" fontSize="24" fontWeight="bold" fill="hsl(var(--foreground))">60%</tspan>
                       <tspan x="50%" dy="1.5em" fontSize="12" fill="hsl(var(--muted-foreground))">Placed</tspan>
                     </text>
                   </PieChart>
                 </ResponsiveContainer>
              </div>
                <p className="text-sm text-muted-foreground mt-2">856 / 1,420 placed</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Target</span>
                  <span className="font-medium">85% (1,207)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Remaining</span>
                  <span className="font-medium text-warning">351 students</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Top Recruiters */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Top Recruiters</h2>
            <div className="space-y-3">
              <RecruiterRow company="Google" hired={24} avgPackage="₹32L" />
              <RecruiterRow company="Microsoft" hired={35} avgPackage="₹26L" />
              <RecruiterRow company="Amazon" hired={48} avgPackage="₹22L" />
              <RecruiterRow company="Goldman Sachs" hired={18} avgPackage="₹28L" />
            </div>
          </motion.div>

          {/* Package Distribution */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Package Distribution</h2>
            <div className="space-y-3">
              <PackageBar label="> ₹30L" count={45} total={856} color="bg-accent" />
              <PackageBar label="₹20-30L" count={180} total={856} color="bg-success" />
              <PackageBar label="₹10-20L" count={420} total={856} color="bg-primary" />
              <PackageBar label="< ₹10L" count={211} total={856} color="bg-muted-foreground" />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/placements/recruiters">
                  <Building2 className="w-4 h-4 mr-2" />
                  Add Recruiter
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/users">
                  <Users className="w-4 h-4 mr-2" />
                  Eligible Students
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
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

interface DriveCardProps {
  company: string;
  role: string;
  date: string;
  slots: number;
  registered: number;
  status: 'confirmed' | 'pending' | 'cancelled';
}

function DriveCard({ company, role, date, slots, registered, status }: DriveCardProps) {
  const statusColors = {
    confirmed: 'status-verified',
    pending: 'status-pending',
    cancelled: 'status-error',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-accent/30 transition-colors">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <Building2 className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="font-semibold text-foreground">{company}</p>
          <p className="text-sm text-muted-foreground">{role}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground">{date}</p>
          <p className="text-xs text-muted-foreground">{registered} registered · {slots} slots</p>
        </div>
        <span className={`status-badge ${statusColors[status]}`}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>
    </div>
  );
}

interface PlacementRowProps {
  name: string;
  company: string;
  role: string;
  package: string;
}

function PlacementRow({ name, company, role, package: pkg }: PlacementRowProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-success/20 flex items-center justify-center">
          <CheckCircle className="w-4 h-4 text-success" />
        </div>
        <div>
          <p className="font-medium text-foreground text-sm">{name}</p>
          <p className="text-xs text-muted-foreground">{company} · {role}</p>
        </div>
      </div>
      <span className="font-semibold text-success">{pkg}</span>
    </div>
  );
}

interface RecruiterRowProps {
  company: string;
  hired: number;
  avgPackage: string;
}

function RecruiterRow({ company, hired, avgPackage }: RecruiterRowProps) {
  return (
    <div className="flex items-center justify-between p-2">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">{company}</span>
      </div>
      <div className="text-right">
        <p className="text-sm font-medium">{hired} hired</p>
        <p className="text-xs text-muted-foreground">{avgPackage} avg</p>
      </div>
    </div>
  );
}

interface PackageBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function PackageBar({ label, count, total, color }: PackageBarProps) {
  const percentage = (count / total) * 100;
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{count}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

export default PlacementOfficerDashboard;
