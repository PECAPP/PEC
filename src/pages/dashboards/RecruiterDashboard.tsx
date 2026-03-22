import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Search,
  Briefcase,
  CheckCircle,
  Clock,
  Building2,
  ArrowUpRight,
  Filter,
  Download,
  Eye,
  Star,
  TrendingUp,
  UserCheck,
  Plus,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Link } from 'react-router-dom';
import { onSnapshot, query, collection, where } from '@/lib/dataClient';
import { usePermissions } from '@/hooks/usePermissions';

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

export function RecruiterDashboard() {
  const { user } = usePermissions();
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApps: 0,
    shortlisted: 0,
    offers: 0,
  });
  const [jobs, setJobs] = useState<any[]>([]);
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Active Jobs
    const unsubJobs = onSnapshot(
      query(collection(({} as any), 'jobs'), where('recruiterId', '==', user.uid)),
      (snap) => {
        setStats(prev => ({ ...prev, activeJobs: snap.size }));
        setJobs(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      }
    );

    // Applications & Stats
    const unsubApps = onSnapshot(
      query(collection(({} as any), 'applications'), where('recruiterId', '==', user.uid)),
      (snap) => {
        const apps = snap.docs.map(doc => doc.data());
        setStats(prev => ({
          ...prev,
          totalApps: snap.size,
          shortlisted: apps.filter(a => a.status === 'shortlisted').length,
          offers: apps.filter(a => a.status === 'hired').length,
        }));
        setRecentCandidates(snap.docs.slice(0, 3).map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }
    );

    return () => {
      unsubJobs();
      unsubApps();
    };
  }, [user]);

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
          <h1 className="text-2xl font-bold text-foreground">Recruiter Portal</h1>
          <p className="text-muted-foreground">Find and verify top candidates from verified institutions</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Shortlist
          </Button>
          <Button variant="default" asChild>
            <Link to="/placements/jobs">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Briefcase}
          label="Active Jobs"
          value={stats.activeJobs.toString()}
          subtext="Currently hiring"
        />
        <StatCard
          icon={Users}
          label="Total Applications"
          value={stats.totalApps.toString()}
          subtext="Across all positions"
          trend="+12% growth"
          trendUp
        />
        <StatCard
          icon={UserCheck}
          label="Shortlisted"
          value={stats.shortlisted.toString()}
          subtext="Ready for interview"
          iconColor="text-foreground"
        />
        <StatCard
          icon={CheckCircle}
          label="Offers Made"
          value={stats.offers.toString()}
          subtext="This hiring cycle"
          iconColor="text-foreground"
        />
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={item} className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search candidates by name, skill, or institution..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="w-4 h-4" />
              Filters
            </Button>
            <Button variant="secondary">
              Search
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Job Listings */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Your Job Postings</h2>
              <Button variant="ghost" size="sm">
                Manage All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {jobs.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No active jobs</div>
              ) : (
                jobs.map(job => (
                  <JobRow
                    key={job.id}
                    title={job.title}
                    location={job.location}
                    applications={0} // Aggregate if needed
                    shortlisted={0}
                    status={job.status}
                    daysLeft={10}
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Top Candidates */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Top Candidates</h2>
              <Button variant="ghost" size="sm">
                View All
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Button>
            </div>
            <div className="space-y-3">
              {recentCandidates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No recent applicants</div>
              ) : (
                recentCandidates.map(can => (
                  <CandidateCard
                    key={can.id}
                    name={can.studentName}
                    institution={can.studentDepartment || "N/A"}
                    role={can.jobTitle}
                    cgpa={can.cgpa || 8.5}
                    skills={['React', 'Node.js']}
                    matchScore={92}
                    verified
                  />
                ))
              )}
            </div>
          </motion.div>

          {/* Verification Scanner */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Resume Verification</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-foreground/10 text-foreground border border-border">ERP Verified</span>
            </div>
            <div className="text-center py-8 border-2 border-dashed border-border rounded-lg">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-3">Scan QR code or upload resume to verify</p>
              <div className="flex gap-2 justify-center">
                <Button variant="outline">
                  Upload Resume
                </Button>
                <Button variant="secondary">
                  Scan QR Code
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Company Profile */}
          <motion.div variants={item} className="card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-lg bg-foreground/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="font-semibold text-foreground">Google India</p>
                <p className="text-sm text-muted-foreground">Technology</p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Partner Since</span>
                <span className="font-medium">2019</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Hires</span>
                <span className="font-medium">156</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Active Jobs</span>
                <span className="font-medium">5</span>
              </div>
            </div>
          </motion.div>

          {/* Application Pipeline */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Pipeline Overview</h2>
            <div className="space-y-4">
              <PipelineItem label="Applied" count={324} percentage={100} color="bg-muted-foreground" />
              <PipelineItem label="Screened" count={186} percentage={57} color="bg-foreground/60" />
              <PipelineItem label="Shortlisted" count={42} percentage={13} color="bg-foreground/40" />
              <PipelineItem label="Interviewed" count={28} percentage={9} color="bg-foreground/20" />
              <PipelineItem label="Offered" count={12} percentage={4} color="bg-primary" />
            </div>
          </motion.div>

          {/* Institutions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Partner Institutions</h2>
            <div className="space-y-3">
              <InstitutionRow name="IIT Delhi" candidates={48} avgCgpa={8.9} />
              <InstitutionRow name="NIT Warangal" candidates={35} avgCgpa={8.6} />
              <InstitutionRow name="BITS Pilani" candidates={28} avgCgpa={8.4} />
              <InstitutionRow name="IIT Bombay" candidates={42} avgCgpa={9.1} />
            </div>
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={item} className="card-elevated p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Briefcase className="w-4 h-4" />
                Post New Job
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Users className="w-4 h-4" />
                Browse Candidates
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <FileText className="w-4 h-4" />
                Download Reports
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

function StatCard({ icon: Icon, label, value, subtext, trend, trendUp, iconColor = 'text-foreground' }: StatCardProps) {
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

interface JobRowProps {
  title: string;
  location: string;
  applications: number;
  shortlisted: number;
  status: 'active' | 'closing' | 'closed';
  daysLeft: number;
}

function JobRow({ title, location, applications, shortlisted, status, daysLeft }: JobRowProps) {
  const statusColors = {
    active: 'bg-foreground/10 text-foreground border-border',
    closing: 'bg-foreground/20 text-foreground border-border font-bold',
    closed: 'bg-muted text-muted-foreground border-border',
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-primary transition-colors group cursor-pointer">
      <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center group-hover:bg-primary-foreground/10 transition-colors">
            <Briefcase className="w-5 h-5 text-foreground group-hover:text-primary-foreground" />
          </div>
        <div>
          <p className="font-semibold text-foreground group-hover:text-primary-foreground transition-colors">{title}</p>
          <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">{location}</p>
        </div>
      </div>
      <div className="flex items-center gap-6">
        <div className="text-right">
          <p className="text-sm font-medium text-foreground group-hover:text-primary-foreground transition-colors">{applications} applied</p>
          <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/60 transition-colors">{shortlisted} shortlisted</p>
        </div>
        <div className="text-right">
          <span className={`status-badge ${statusColors[status]} group-hover:bg-primary-foreground group-hover:text-primary border-none`}>
            {status === 'closing' ? `${daysLeft}d left` : status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        </div>
      </div>
    </div>
  );
}

interface CandidateCardProps {
  name: string;
  institution: string;
  role: string;
  cgpa: number;
  skills: string[];
  matchScore: number;
  verified: boolean;
}

function CandidateCard({ name, institution, role, cgpa, skills, matchScore, verified }: CandidateCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border hover:bg-primary transition-all group cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
            <span className="text-sm font-semibold text-primary group-hover:text-primary">{name.charAt(0)}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground group-hover:text-primary-foreground transition-colors">{name}</p>
              {verified && <CheckCircle className="w-4 h-4 text-foreground opacity-50 group-hover:text-primary-foreground group-hover:opacity-100" />}
            </div>
            <p className="text-sm text-muted-foreground group-hover:text-primary-foreground/70 transition-colors">{institution} · {cgpa} CGPA</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground group-hover:text-primary-foreground transition-colors">{matchScore}%</span>
          <Star className="w-4 h-4 text-warning fill-warning group-hover:text-primary-foreground group-hover:fill-primary-foreground" />
        </div>
      </div>
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border group-hover:border-primary-foreground/20">
        <div className="flex gap-1.5 flex-wrap">
          {skills.map(skill => (
            <span key={skill} className="px-2 py-0.5 text-xs bg-secondary rounded-full text-foreground group-hover:bg-primary-foreground group-hover:text-primary transition-colors">
              {skill}
            </span>
          ))}
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="sm">
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

interface PipelineItemProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

function PipelineItem({ label, count, percentage, color }: PipelineItemProps) {
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

interface InstitutionRowProps {
  name: string;
  candidates: number;
  avgCgpa: number;
}

function InstitutionRow({ name, candidates, avgCgpa }: InstitutionRowProps) {
  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-sm font-medium text-foreground">{name}</span>
      <div className="text-right">
        <p className="text-sm font-medium">{candidates}</p>
        <p className="text-xs text-muted-foreground">{avgCgpa} avg</p>
      </div>
    </div>
  );
}

export default RecruiterDashboard;
