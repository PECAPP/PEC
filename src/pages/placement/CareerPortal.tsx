import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useParams } from 'react-router-dom';
import {
  Briefcase,
  User,
  Target,
  Calendar,
  FileText,
  Users,
  BarChart3,
  Gift,
  Cog,
  TrendingUp,
  Building2,
  Award,
  Star,
  ChevronRight,
  Loader2,
  GraduationCap,
  Clock,
  CheckCircle,
  MapPin,
  IndianRupee,
} from 'lucide-react';
import { ImageWithBlur } from '@/components/ui/image-with-blur';
import { DashboardSkeleton } from '@/components/ui/skeletons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { cn } from '@/lib/utils';
import type { UserRole } from '@/types';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

interface QuickLink {
  icon: React.ElementType;
  label: string;
  description: string;
  path: string;
  color: string;
  roles: UserRole[];
}

const quickLinks: QuickLink[] = [
  // Student links
  {
    icon: User,
    label: 'My Profile',
    description: 'Skills, projects & certifications',
    path: '/placements/profile',
    color: 'from-blue-500 to-indigo-500',
    roles: ['student'],
  },
  {
    icon: Target,
    label: 'My Applications',
    description: 'Track your job applications',
    path: '/placements/my-dashboard',
    color: 'from-green-500 to-emerald-500',
    roles: ['student'],
  },
  {
    icon: Calendar,
    label: 'Interviews',
    description: 'Upcoming & past interviews',
    path: '/placements/interviews',
    color: 'from-purple-500 to-violet-500',
    roles: ['student'],
  },
  {
    icon: Briefcase,
    label: 'Job Board',
    description: 'Browse available positions',
    path: '/placements/jobs',
    color: 'from-orange-500 to-amber-500',
    roles: ['student', 'faculty', 'college_admin'],
  },
  {
    icon: Building2,
    label: 'Placement Drives',
    description: 'Upcoming campus drives',
    path: '/placements/drives',
    color: 'from-cyan-500 to-teal-500',
    roles: ['student', 'faculty', 'college_admin'],
  },
  {
    icon: FileText,
    label: 'Resume Builder',
    description: 'Create professional resume',
    path: '/resume-builder',
    color: 'from-pink-500 to-rose-500',
    roles: ['student'],
  },
  // Faculty/Admin links
  {
    icon: Users,
    label: 'Student Readiness',
    description: 'Track profile completion',
    path: '/placements/student-readiness',
    color: 'from-blue-500 to-indigo-500',
    roles: ['faculty', 'college_admin'],
  },
  {
    icon: BarChart3,
    label: 'Placement Reports',
    description: 'Analytics & statistics',
    path: '/placements/reports',
    color: 'from-green-500 to-emerald-500',
    roles: ['faculty', 'college_admin'],
  },
  {
    icon: Users,
    label: 'Applications',
    description: 'Manage all applications',
    path: '/placements/applications',
    color: 'from-purple-500 to-violet-500',
    roles: ['faculty', 'college_admin'],
  },
  {
    icon: Building2,
    label: 'Partner Companies',
    description: 'Partner companies',
    path: '/placements/applications',
    color: 'from-orange-500 to-amber-500',
    roles: ['faculty', 'college_admin'],
  },
  // Admin links
  {
    icon: Cog,
    label: 'Placement Settings',
    description: 'Configure requirements',
    path: '/admin/placement-settings',
    color: 'from-gray-500 to-slate-500',
    roles: ['college_admin'],
  },
  {
    icon: TrendingUp,
    label: 'Placement Insights',
    description: 'Executive dashboard',
    path: '/admin/placement-insights',
    color: 'from-indigo-500 to-purple-500',
    roles: ['college_admin'],
  },
];

export default function CareerPortal() {
  const { user } = useAuth();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    profileScore: 0,
    applications: 0,
    interviews: 0,
    offers: 0,
    jobsAvailable: 0,
    upcomingDrives: 0,
  });
  const [recentJobs, setRecentJobs] = useState<any[]>([]);

  const userRole = (user?.role || 'student') as UserRole;
  const filteredLinks = quickLinks.filter(link => link.roles.includes(userRole));

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load recent jobs
        const jobsQuery = query(
          collection(({} as any), 'jobs'),
          where('status', '==', 'open'),
          orderBy('postedAt', 'desc'),
          limit(4)
        );
        const jobsSnap = await getDocs(jobsQuery);
        const jobs = jobsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setRecentJobs(jobs);

        // Count all open jobs
        const allJobsQuery = query(
          collection(({} as any), 'jobs'),
          where('status', '==', 'open')
        );
        const allJobsSnap = await getDocs(allJobsQuery);

        // Load student-specific stats
        if (userRole === 'student' && user?.uid) {
          // Get placement profile
          const profileRef = doc(({} as any), 'placementProfiles', user.uid);
          const profileSnap = await getDoc(profileRef);
          
          // Get applications for this student
          const applicationsQuery = query(
            collection(({} as any), 'applications'),
            where('studentId', '==', user.uid)
          );
          const applicationsSnap = await getDocs(applicationsQuery);
          const applications = applicationsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
          
          // Count interviews (actual scheduled meetings)
          const interviewsQuery = query(
            collection(({} as any), 'interviews'),
            where('studentId', '==', user.uid)
          );
          const interviewsSnap = await getDocs(interviewsQuery);
          const interviewCount = interviewsSnap.size;
          
          // Count offers
          const offerCount = applications.filter(
            (app: any) => ['offered', 'hired'].includes(app.status)
          ).length;

          setStats({
            profileScore: profileSnap.exists() ? profileSnap.data().placementReadinessScore || 0 : 0,
            applications: applications.length,
            interviews: interviewCount,
            offers: offerCount,
            jobsAvailable: allJobsSnap.docs.length,
            upcomingDrives: 0,
          });
        } else {
          setStats(prev => ({
            ...prev,
            jobsAvailable: allJobsSnap.docs.length,
          }));
        }

        setLoading(false);
      } catch (error) {
        console.error('Error loading career portal data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, [user?.uid, userRole]);

  const buildPath = (path: string) => orgSlug ? `/${orgSlug}${path}` : path;

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Hero Section */}
      <motion.div variants={item} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border p-8">
        <div className="absolute inset-0 bg-grid-white/5" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-foreground">Career Portal</h1>
              <p className="text-lg text-muted-foreground mt-2">
                {userRole === 'student' && 'Build your career, track applications, and land your dream job'}
                {userRole === 'college_admin' && 'Monitor placement performance and configure settings'}
                {userRole === 'faculty' && 'View placement drives and support student placements'}
              </p>
            </div>
            
            {userRole === 'student' && (
              <div className="flex items-center gap-4 p-4 rounded-xl bg-background/80 backdrop-blur border">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Profile Readiness</p>
                  <p className={cn(
                    "text-3xl font-bold",
                    stats.profileScore >= 70 ? "text-green-500" :
                    stats.profileScore >= 40 ? "text-yellow-500" : "text-red-500"
                  )}>
                    {stats.profileScore}%
                  </p>
                </div>
                <Progress value={stats.profileScore} className="w-24 h-3" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={buildPath(link.path)}>
                <Card className="group h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform",
                        link.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-semibold truncate">{link.label}</h3>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                        </div>
                        <p className="text-sm text-muted-foreground mt-0.5">{link.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Overview (for students) */}
      {userRole === 'student' && (
        <motion.div variants={item}>
          <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.applications}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Interviews</p>
                  <p className="text-2xl font-bold">{stats.interviews}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Offers</p>
                  <p className="text-2xl font-bold">{stats.offers}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Jobs Available</p>
                  <p className="text-2xl font-bold">{recentJobs.length}+</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}

      {/* Recent Jobs */}
      {recentJobs.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Opportunities</h2>
            <Button variant="ghost" asChild>
              <Link to={buildPath('/placements/jobs')}>
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {recentJobs.map((job) => (
              <Card key={job.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden border border-border">
                      {job.companyLogo ? (
                        <ImageWithBlur src={job.companyLogo} alt={job.companyName} className="w-full h-full object-cover" />
                      ) : (
                        <ImageWithBlur 
                           src={`https://source.unsplash.com/random/100x100/?${encodeURIComponent(job.companyName)},logo`}
                           alt={job.companyName} 
                           className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.companyName}</p>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-xs">{job.type || 'Full-time'}</Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {job.location}
                        </span>
                        {job.salary && (
                          <span className="text-xs font-medium text-green-600 flex items-center gap-1">
                            <IndianRupee className="w-3 h-3" />
                            {job.salary}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tips Section (for students) */}
      {userRole === 'student' && stats.profileScore < 70 && (
        <motion.div variants={item}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Star className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Boost Your Profile</h3>
                  <p className="text-muted-foreground mt-1">
                    Complete your placement profile to improve your chances of getting shortlisted by companies.
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Button size="sm" asChild>
                      <Link to={buildPath('/placements/profile')}>
                        Complete Profile
                      </Link>
                    </Button>
                    <Button size="sm" variant="outline" asChild>
                      <Link to={buildPath('/resume-builder')}>
                        Build Resume
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
