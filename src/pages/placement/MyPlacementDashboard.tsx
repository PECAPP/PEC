import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  Building2,
  MapPin,
  TrendingUp,
  Target,
  Star,
  Loader2,
  ChevronRight,
  Users,
  DollarSign,
  Video,
} from 'lucide-react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
  getDocs,
  doc
} from '@/lib/dataClient';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isAfter, isBefore, addDays } from 'date-fns';
import type { JobApplication, ExtendedJob, InterviewSchedule, PlacementProfile } from '@/types';

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

const statusConfig: Record<JobApplication['status'], { label: string; color: string; icon: React.ElementType }> = {
  'applied': { label: 'Applied', color: 'bg-blue-500', icon: Clock },
  'under-review': { label: 'Under Review', color: 'bg-yellow-500', icon: AlertCircle },
  'shortlisted': { label: 'Shortlisted', color: 'bg-green-500', icon: CheckCircle2 },
  'interview-scheduled': { label: 'Interview Scheduled', color: 'bg-purple-500', icon: Calendar },
  'interviewed': { label: 'Interviewed', color: 'bg-indigo-500', icon: Users },
  'offered': { label: 'Offer Received', color: 'bg-emerald-500', icon: Star },
  'hired': { label: 'Hired!', color: 'bg-green-600', icon: CheckCircle2 },
  'rejected': { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  'withdrawn': { label: 'Withdrawn', color: 'bg-gray-500', icon: XCircle },
};

export default function MyPlacementDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<(JobApplication & { job?: ExtendedJob })[]>([]);
  const [upcomingInterviews, setUpcomingInterviews] = useState<InterviewSchedule[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<ExtendedJob[]>([]);
  const [profile, setProfile] = useState<PlacementProfile | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    shortlisted: 0,
    interviews: 0,
    offers: 0,
  });

  useEffect(() => {
    if (!user?.uid) return;

    setLoading(true);
    const unsubscribers: (() => void)[] = [];

    // Load applications
    const applicationsQuery = query(
      collection(({} as any), 'applications'),
      where('studentId', '==', user.uid),
      orderBy('appliedAt', 'desc'),
      limit(20)
    );

    unsubscribers.push(
      onSnapshot(applicationsQuery, async (snapshot) => {
        const apps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as JobApplication[];

        // Calculate stats
        const newStats = {
          total: apps.length,
          shortlisted: apps.filter(a => ['shortlisted', 'interview-scheduled', 'interviewed', 'offered', 'hired'].includes(a.status)).length,
          interviews: apps.filter(a => ['interview-scheduled', 'interviewed'].includes(a.status)).length,
          offers: apps.filter(a => ['offered', 'hired'].includes(a.status)).length,
        };
        setStats(newStats);

        // Fetch job details for each application
        const jobIds = [...new Set(apps.map(a => a.jobId))];
        if (jobIds.length > 0) {
          const jobsQuery = query(
            collection(({} as any), 'jobs'),
            where('__name__', 'in', jobIds.slice(0, 10))
          );
          const jobsSnap = await getDocs(jobsQuery);
          const jobsMap = new Map<string, ExtendedJob>();
          jobsSnap.docs.forEach(doc => {
            jobsMap.set(doc.id, { id: doc.id, ...doc.data() } as ExtendedJob);
          });

          setApplications(apps.map(app => ({
            ...app,
            job: jobsMap.get(app.jobId)
          })));
        } else {
          setApplications(apps);
        }
        setLoading(false);
      }, (error) => {
        console.error('Error loading applications:', error);
        setLoading(false);
      })
    );

    // Load upcoming interviews
    const interviewsQuery = query(
      collection(({} as any), 'interviews'),
      where('studentId', '==', user.uid),
      where('status', '==', 'scheduled'),
      orderBy('scheduledDate', 'asc'),
      limit(5)
    );

    unsubscribers.push(
      onSnapshot(interviewsQuery, (snapshot) => {
        const interviews = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as InterviewSchedule[];
        setUpcomingInterviews(interviews);
      }, (error) => {
        console.error('Error loading interviews:', error);
      })
    );

    // Load recommended jobs
    const jobsQuery = query(
      collection(({} as any), 'jobs'),
      where('status', '==', 'open'),
      orderBy('postedAt', 'desc'),
      limit(6)
    );

    unsubscribers.push(
      onSnapshot(jobsQuery, (snapshot) => {
        const jobs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ExtendedJob[];
        setRecommendedJobs(jobs);
      }, (error) => {
        console.error('Error loading jobs:', error);
      })
    );

    // Load user profile
    const profileRef = doc(({} as any), 'placementProfiles', user.uid);
    unsubscribers.push(
      onSnapshot(profileRef, (doc) => {
        if (doc.exists()) {
          setProfile(doc.data() as PlacementProfile);
        }
      })
    );

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [user?.uid]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const activeApplications = applications.filter(a => !['rejected', 'withdrawn', 'hired'].includes(a.status));
  const completedApplications = applications.filter(a => ['rejected', 'withdrawn', 'hired'].includes(a.status));

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Placements</h1>
          <p className="text-muted-foreground mt-1">
            Track your applications and upcoming interviews
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link to={orgSlug ? `/${orgSlug}/placements/profile` : '/placements/profile'}>
              <FileText className="w-4 h-4 mr-2" />
              Edit Profile
            </Link>
          </Button>
          <Button asChild>
            <Link to={orgSlug ? `/${orgSlug}/placements/jobs` : '/placements/jobs'}>
              <Briefcase className="w-4 h-4 mr-2" />
              Browse Jobs
            </Link>
          </Button>
        </div>
      </motion.div>

      {/* Missing Resume Alert */}
      {!loading && (!profile?.resumeUrl) && (
        <motion.div variants={item} className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
               <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
             </div>
             <div>
               <h3 className="font-bold text-red-700 dark:text-red-300">Resume Missing!</h3>
               <p className="text-sm text-red-600/80 dark:text-red-400/80">You cannot apply to jobs without a resume. Upload it now.</p>
             </div>
          </div>
          <Button variant="destructive" asChild size="sm">
            <Link to={orgSlug ? `/${orgSlug}/placements/profile` : '/placements/profile'}>
              <FileText className="w-4 h-4 mr-2" />
              Upload Resume
            </Link>
          </Button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Applications</p>
                <p className="text-3xl font-bold">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Shortlisted</p>
                <p className="text-3xl font-bold text-green-500">{stats.shortlisted}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Interviews</p>
                <p className="text-3xl font-bold text-purple-500">{stats.interviews}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Offers</p>
                <p className="text-3xl font-bold text-emerald-500">{stats.offers}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-emerald-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Interviews */}
      {upcomingInterviews.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-purple-500/20 bg-purple-500/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-500" />
                Upcoming Interviews
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingInterviews.map((interview) => (
                  <div 
                    key={interview.id} 
                    className="flex items-center justify-between p-3 rounded-lg bg-background border"
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        interview.mode === 'video-call' ? "bg-blue-500/10" : "bg-green-500/10"
                      )}>
                        {interview.mode === 'video-call' ? (
                          <Video className="w-5 h-5 text-blue-500" />
                        ) : (
                          <Building2 className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{interview.roundName}</p>
                        <p className="text-sm text-muted-foreground">
                          {interview.scheduledDate?.toDate ? 
                            format(interview.scheduledDate.toDate(), 'MMM d, yyyy') : 
                            'Date TBD'
                          } at {interview.startTime}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{interview.roundType}</Badge>
                      {interview.meetingLink && (
                        <Button size="sm" asChild>
                          <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                            Join
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Main Content */}
      <motion.div variants={item}>
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">
              Active ({activeApplications.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedApplications.length})
            </TabsTrigger>
            <TabsTrigger value="recommended">
              Recommended Jobs
            </TabsTrigger>
          </TabsList>

          {/* Active Applications */}
          <TabsContent value="active" className="space-y-4">
            {activeApplications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Briefcase className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No active applications</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Start applying to jobs to track your progress here
                  </p>
                  <Button asChild className="mt-4">
                    <Link to={orgSlug ? `/${orgSlug}/placements/jobs` : '/placements/jobs'}>
                      Browse Jobs
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {activeApplications.map((app) => {
                  const status = statusConfig[app.status] || statusConfig['applied'];
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={app.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h3 className="font-semibold truncate">
                                  {app.job?.title || 'Job Title'}
                                </h3>
                                <Badge className={cn("text-white text-xs", status.color)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {app.job?.companyName || 'Company'}
                              </p>
                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {app.job?.location || 'Location'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  Applied {app.appliedAt?.toDate ? 
                                    formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true }) : 
                                    'recently'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon">
                            <ChevronRight className="w-5 h-5" />
                          </Button>
                        </div>
                        
                        {/* Application Timeline */}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={
                                app.status === 'applied' ? 20 :
                                app.status === 'under-review' ? 40 :
                                app.status === 'shortlisted' ? 60 :
                                app.status === 'interview-scheduled' ? 70 :
                                app.status === 'interviewed' ? 80 :
                                app.status === 'offered' ? 90 : 100
                              } 
                              className="h-2 flex-1" 
                            />
                            <span className="text-xs text-muted-foreground whitespace-nowrap">
                              {app.currentRound ? `Round ${app.currentRound}` : 'In Progress'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Completed Applications */}
          <TabsContent value="completed" className="space-y-4">
            {completedApplications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No completed applications</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Your completed applications will appear here
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {completedApplications.map((app) => {
                  const status = statusConfig[app.status] || statusConfig['applied'];
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={app.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex gap-4 flex-1 min-w-0">
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0">
                              <Building2 className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold truncate">
                                  {app.job?.title || 'Job Title'}
                                </h3>
                                <Badge variant="outline" className={cn("text-xs", 
                                  app.status === 'hired' && "bg-green-500/10 text-green-500 border-green-500/20"
                                )}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {app.job?.companyName || 'Company'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Recommended Jobs */}
          <TabsContent value="recommended" className="space-y-4">
            {recommendedJobs.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Target className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No recommended jobs</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    Complete your profile to get personalized job recommendations
                  </p>
                  <Button asChild className="mt-4" variant="outline">
                    <Link to={orgSlug ? `/${orgSlug}/placements/profile` : '/placements/profile'}>
                      Complete Profile
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendedJobs.map((job) => (
                  <Card key={job.id} className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => navigate(orgSlug ? `/${orgSlug}/placements/jobs` : '/placements/jobs')}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.companyName} className="w-6 h-6" />
                          ) : (
                            <Building2 className="w-5 h-5 text-primary" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-medium truncate">{job.title}</h3>
                          <p className="text-sm text-muted-foreground">{job.companyName}</p>
                          <div className="flex flex-wrap items-center gap-2 mt-2">
                            <Badge variant="secondary" className="text-xs">
                              {job.type}
                            </Badge>
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {job.location}
                            </span>
                          </div>
                          <p className="text-sm font-medium text-primary mt-2">
                            {job.salary}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
