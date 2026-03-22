import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  HourglassIcon,
  Eye,
  ArrowLeft,
  Filter,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { usePermissions } from '@/hooks/usePermissions';
import { cn } from '@/lib/utils';
import api from '@/lib/api';

interface Application {
  id: string;
  jobId: string;
  title?: string;
  company?: string;
  location?: string;
  appliedAt: any;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted';
  feedback?: string;
}

type ApiResponse<T> = { success: boolean; data: T; meta?: any };

const extractData = <T,>(response: any): T => {
  if (response?.data?.data !== undefined) return response.data.data as T;
  return response?.data as T;
};

const formatDate = (value: any) => {
  if (!value) return 'N/A';
  if (value?.toDate) return value.toDate().toLocaleDateString();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? 'N/A' : parsed.toLocaleDateString();
};

export default function MyApplications() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);
  const [applications, setApplications] = useState<Application[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [applicationsApiAvailable, setApplicationsApiAvailable] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    
    fetchApplications(user.uid);
  }, [authLoading, user, navigate]);

  const fetchApplications = async (uid: string) => {
    try {
      const jobsResponse = await api.get<ApiResponse<any[]>>('/jobs', {
        params: { limit: 100, offset: 0 },
      });
      const jobs = extractData<any[]>(jobsResponse) || [];
      const jobsById = new Map(jobs.map((job: any) => [job.id, job]));

      let apps: any[] = [];
      try {
        const appsResponse = await api.get<ApiResponse<any[]>>('/applications', {
          params: { studentId: uid, limit: 100, offset: 0 },
        });
        apps = extractData<any[]>(appsResponse) || [];
        setApplicationsApiAvailable(true);
      } catch (error: any) {
        if (error?.response?.status === 404) {
          setApplicationsApiAvailable(false);
          toast.info('Applications API is not available yet.');
          apps = [];
        } else {
          throw error;
        }
      }

      const appsData = apps.map((appData: any) => {
        const jobData = jobsById.get(appData.jobId);
        return {
          id: appData.id,
          ...appData,
          title: jobData?.title || appData.title || 'Unknown Job',
          company: jobData?.company || appData.company || 'Unknown Company',
          location: jobData?.location || appData.location || 'Unknown',
        } as Application;
      });
      
      setApplications(appsData);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === 'all') return true;
    return app.status === activeTab;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pending':
        return { icon: HourglassIcon, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Pending Review' };
      case 'shortlisted':
        return { icon: CheckCircle2, color: 'text-primary', bg: 'bg-primary/10', label: 'Shortlisted' };
      case 'accepted':
        return { icon: CheckCircle2, color: 'text-success', bg: 'bg-success/10', label: 'Accepted' };
      case 'rejected':
        return { icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/10', label: 'Not Selected' };
      default:
        return { icon: Clock, color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const stats = {
    total: applications.length,
    pending: applications.filter(a => a.status === 'pending').length,
    shortlisted: applications.filter(a => a.status === 'shortlisted').length,
    accepted: applications.filter(a => a.status === 'accepted').length,
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/placements')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground">Track your job application status</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Applications</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-muted">
              <HourglassIcon className="w-5 h-5 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <CheckCircle2 className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Shortlisted</p>
              <p className="text-2xl font-bold text-foreground">{stats.shortlisted}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Accepted</p>
              <p className="text-2xl font-bold text-foreground">{stats.accepted}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated">
        {!applicationsApiAvailable && (
          <div className="px-4 pt-4 text-sm text-muted-foreground">
            Applications backend is not configured yet.
          </div>
        )}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="p-4 border-b border-border">
            <TabsList>
              <TabsTrigger value="all">All ({applications.length})</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="shortlisted">Shortlisted</TabsTrigger>
              <TabsTrigger value="accepted">Accepted</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
            </TabsList>
          </div>

          <div className="divide-y divide-border">
            {filteredApplications.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              filteredApplications.map((app, index) => {
                const statusConfig = getStatusConfig(app.status);
                const StatusIcon = statusConfig.icon;
                
                return (
                  <motion.div
                    key={app.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-5 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                        {app.company?.[0] || 'C'}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                          <h3 className="font-semibold text-foreground">{app.title}</h3>
                          <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0')}>
                            {statusConfig.label}
                          </Badge>
                        </div>
                        <p className="text-primary font-medium">{app.company}</p>
                        <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {app.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            Applied {formatDate(app.appliedAt)}
                          </span>
                        </div>
                        {app.feedback && (
                          <div className="mt-2 p-2 rounded-lg bg-secondary/50 text-sm">
                            <span className="font-medium text-foreground">Feedback: </span>
                            <span className="text-muted-foreground">{app.feedback}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <Button variant="outline" onClick={() => navigate(`/placements`)}>
                          <Eye className="w-4 h-4 mr-2" />
                          View Jobs
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </Tabs>
      </div>
    </motion.div>
  );
}
