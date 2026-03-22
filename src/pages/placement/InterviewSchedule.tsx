import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  Video,
  Building2,
  MapPin,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  FileText,
  Copy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, isAfter, isBefore, isToday, addHours } from 'date-fns';
import type { InterviewSchedule as InterviewScheduleType } from '@/types';

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

const roundTypeColors: Record<string, string> = {
  'aptitude': 'bg-blue-500/10 text-blue-500',
  'technical': 'bg-purple-500/10 text-purple-500',
  'hr': 'bg-green-500/10 text-green-500',
  'coding': 'bg-orange-500/10 text-orange-500',
  'group-discussion': 'bg-pink-500/10 text-pink-500',
  'other': 'bg-gray-500/10 text-gray-500',
};

const statusConfig = {
  'scheduled': { label: 'Scheduled', color: 'bg-blue-500', icon: Clock },
  'completed': { label: 'Completed', color: 'bg-green-500', icon: CheckCircle },
  'cancelled': { label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  'rescheduled': { label: 'Rescheduled', color: 'bg-yellow-500', icon: AlertCircle },
  'no-show': { label: 'No Show', color: 'bg-gray-500', icon: XCircle },
};

export default function InterviewSchedule() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [interviews, setInterviews] = useState<InterviewScheduleType[]>([]);
  const [filter, setFilter] = useState<'upcoming' | 'past' | 'all'>('upcoming');

  useEffect(() => {
    if (!user?.uid) return;

    const interviewsQuery = query(
      collection(({} as any), 'interviews'),
      where('studentId', '==', user.uid),
      orderBy('scheduledDate', 'desc')
    );

    const unsubscribe = onSnapshot(interviewsQuery, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InterviewScheduleType[];
      setInterviews(data);
      setLoading(false);
    }, (error) => {
      console.error('Error loading interviews:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user?.uid]);

  const now = new Date();
  const upcomingInterviews = interviews.filter(i => 
    i.status === 'scheduled' && i.scheduledDate?.toDate && isAfter(i.scheduledDate.toDate(), now)
  );
  const pastInterviews = interviews.filter(i => 
    i.status !== 'scheduled' || (i.scheduledDate?.toDate && isBefore(i.scheduledDate.toDate(), now))
  );

  const filteredInterviews = filter === 'upcoming' ? upcomingInterviews : 
                             filter === 'past' ? pastInterviews : interviews;

  const todayInterviews = upcomingInterviews.filter(i => 
    i.scheduledDate?.toDate && isToday(i.scheduledDate.toDate())
  );

  const copyMeetingLink = (link: string) => {
    navigator.clipboard.writeText(link);
    toast.success('Meeting link copied to clipboard');
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
      <motion.div variants={item} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Schedule</h1>
          <p className="text-muted-foreground mt-1">
            View and manage your upcoming interviews
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-green-500 font-medium">
              {upcomingInterviews.length} Upcoming
            </span>
          </div>
        </div>
      </motion.div>

      {/* Today's Interviews Alert */}
      {todayInterviews.length > 0 && (
        <motion.div variants={item}>
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    You have {todayInterviews.length} interview{todayInterviews.length > 1 ? 's' : ''} today!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {todayInterviews.map(i => `${i.roundName} at ${i.startTime}`).join(', ')}
                  </p>
                </div>
                <Button size="sm">
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div variants={item}>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
          <TabsList>
            <TabsTrigger value="upcoming">
              Upcoming ({upcomingInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past ({pastInterviews.length})
            </TabsTrigger>
            <TabsTrigger value="all">
              All ({interviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {filteredInterviews.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No interviews {filter === 'upcoming' ? 'scheduled' : 'found'}</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    {filter === 'upcoming' 
                      ? 'When you get shortlisted, your interviews will appear here'
                      : 'No past interviews to show'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredInterviews.map((interview) => {
                  const status = statusConfig[interview.status];
                  const StatusIcon = status.icon;
                  const interviewDate = interview.scheduledDate?.toDate?.();
                  const isUpcoming = interviewDate && isAfter(interviewDate, now);
                  const isTodayInterview = interviewDate && isToday(interviewDate);

                  return (
                    <Card 
                      key={interview.id} 
                      className={cn(
                        "transition-all",
                        isTodayInterview && "border-primary/30 shadow-md",
                        !isUpcoming && interview.status === 'scheduled' && "opacity-60"
                      )}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          {/* Date/Time Block */}
                          <div className="lg:w-48 shrink-0">
                            <div className={cn(
                              "p-4 rounded-xl text-center",
                              isTodayInterview ? "bg-primary text-primary-foreground" : "bg-muted"
                            )}>
                              <p className="text-sm font-medium opacity-80">
                                {interviewDate ? format(interviewDate, 'EEEE') : 'TBD'}
                              </p>
                              <p className="text-2xl font-bold">
                                {interviewDate ? format(interviewDate, 'MMM d') : 'TBD'}
                              </p>
                              <p className="text-lg font-semibold">
                                {interview.startTime} - {interview.endTime}
                              </p>
                              {interview.duration && (
                                <p className="text-xs opacity-80 mt-1">
                                  {interview.duration} minutes
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Details */}
                          <div className="flex-1 space-y-4">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <h3 className="text-xl font-semibold">{interview.roundName}</h3>
                                  <Badge className={roundTypeColors[interview.roundType] || roundTypeColors.other}>
                                    {interview.roundType}
                                  </Badge>
                                  <Badge variant="outline" className={cn(
                                    "text-xs",
                                    interview.status === 'completed' && "bg-green-500/10 text-green-500 border-green-500/20",
                                    interview.status === 'cancelled' && "bg-red-500/10 text-red-500 border-red-500/20"
                                  )}>
                                    <StatusIcon className="w-3 h-3 mr-1" />
                                    {status.label}
                                  </Badge>
                                </div>
                                <p className="text-muted-foreground mt-1">
                                  Round {interview.roundNumber}
                                </p>
                              </div>

                              {isUpcoming && interview.status === 'scheduled' && (
                                <div className="text-right">
                                  <p className="text-sm text-muted-foreground">Starts in</p>
                                  <p className="font-semibold text-primary">
                                    {interviewDate && formatDistanceToNow(interviewDate)}
                                  </p>
                                </div>
                              )}
                            </div>

                            <Separator />

                            <div className="grid gap-3 sm:grid-cols-2">
                              <div className="flex items-center gap-2 text-sm">
                                {interview.mode === 'video-call' ? (
                                  <Video className="w-4 h-4 text-blue-500" />
                                ) : interview.mode === 'phone' ? (
                                  <Users className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Building2 className="w-4 h-4 text-orange-500" />
                                )}
                                <span className="capitalize">{interview.mode.replace('-', ' ')}</span>
                              </div>

                              {interview.location && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <MapPin className="w-4 h-4" />
                                  <span>{interview.location}</span>
                                </div>
                              )}

                              {interview.interviewerNames && interview.interviewerNames.length > 0 && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Users className="w-4 h-4" />
                                  <span>Interviewer: {interview.interviewerNames.join(', ')}</span>
                                </div>
                              )}
                            </div>

                            {/* Meeting Link */}
                            {interview.meetingLink && interview.status === 'scheduled' && isUpcoming && (
                              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-500/5 border border-blue-500/20">
                                <Video className="w-5 h-5 text-blue-500" />
                                <span className="flex-1 text-sm truncate">{interview.meetingLink}</span>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => copyMeetingLink(interview.meetingLink!)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                                <Button size="sm" asChild>
                                  <a href={interview.meetingLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="w-4 h-4 mr-1" />
                                    Join
                                  </a>
                                </Button>
                              </div>
                            )}

                            {/* Feedback (for completed) */}
                            {interview.feedback && interview.status === 'completed' && (
                              <div className="p-3 rounded-lg bg-muted/50">
                                <p className="text-sm font-medium mb-1">Feedback</p>
                                <p className="text-sm text-muted-foreground">{interview.feedback}</p>
                                {interview.outcome && (
                                  <Badge 
                                    className={cn(
                                      "mt-2",
                                      interview.outcome === 'passed' && "bg-green-500",
                                      interview.outcome === 'failed' && "bg-red-500"
                                    )}
                                  >
                                    {interview.outcome === 'passed' ? 'Passed' : 
                                     interview.outcome === 'failed' ? 'Did not pass' : 'Pending Result'}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Tips Card */}
      {upcomingInterviews.length > 0 && (
        <motion.div variants={item}>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Interview Preparation Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Review the job description and company background
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Prepare examples of your past projects and experiences
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Test your audio/video setup for virtual interviews
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Join the meeting 5 minutes early
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                  Keep your resume and portfolio handy
                </li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
