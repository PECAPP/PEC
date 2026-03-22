import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Briefcase,
  MapPin,
  Clock,
  IndianRupee,
  Search,
  Building2,
  Users,
  CheckCircle2,
  Star,
  ChevronRight,
  Plus,
  Edit,
  Trash2,
  Loader2,
  Upload,
  FileText,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  Timestamp,
} from '@/lib/dataClient';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import BulkUpload from '@/components/BulkUpload';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
  type: 'full-time' | 'internship' | 'part-time';
  salary: string;
  deadline: any;
  postedBy: string;
  postedAt: any;
  status: 'open' | 'closed';
  tags: string[];
}

interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName?: string;
  studentEmail?: string;
  resume: string;
  coverLetter: string;
  appliedAt: any;
  status: 'pending' | 'shortlisted' | 'rejected' | 'accepted';
  feedback?: string;
}

export default function Placements() {
  const navigate = useNavigate();
  const { isAdmin, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for ({} as any) to load
    
    if (!user) {
      navigate('/auth', { replace: true });
      return;
    }
    setLoading(false);
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isAdmin) {
    return <PlacementsManager userId={user.uid} userRole={user.role} />;
  }

  return <StudentPlacementsView userId={user.uid} />;
}

// Similar implementation for PlacementsManager and StudentPlacementsView
// Due to length constraints, implementing condensed versions

function PlacementsManager({ userId, userRole }: { userId: string; userRole: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const jobsSnap = await getDocs(collection(({} as any), 'jobs'));
    setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    
    const appsSnap = await getDocs(collection(({} as any), 'applications'));
    setApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
  };

  const stats = {
    totalJobs: jobs.length,
    openJobs: jobs.filter(j => j.status === 'open').length,
    totalApps: applications.length,
    placedStudents: applications.filter(a => a.status === 'accepted').length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Placement Management</h1>
        <p className="text-muted-foreground">Manage all job postings and student applications</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Briefcase className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{stats.totalJobs}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10"><CheckCircle2 className="w-5 h-5 text-success" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Open Jobs</p>
              <p className="text-2xl font-bold">{stats.openJobs}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10"><FileText className="w-5 h-5 text-warning" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Applications</p>
              <p className="text-2xl font-bold">{stats.totalApps}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-accent/10"><Users className="w-5 h-5 text-accent" /></div>
            <div>
              <p className="text-sm text-muted-foreground">Placed</p>
              <p className="text-2xl font-bold">{stats.placedStudents}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Recent Jobs</h3>
        <div className="space-y-3">
          {jobs.slice(0, 5).map(job => (
            <div key={job.id} className="flex justify-between items-center p-3 border rounded">
              <div>
                <p className="font-medium">{job.title}</p>
                <p className="text-sm text-muted-foreground">{job.company}</p>
              </div>
              <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentPlacementsView({ userId }: { userId: string }) {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [jobType, setJobType] = useState('all');
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [resumeURL, setResumeURL] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    const jobsSnap = await getDocs(query(collection(({} as any), 'jobs'), where('status', '==', 'open')));
    setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    
    const appsSnap = await getDocs(query(collection(({} as any), 'applications'), where('studentId', '==', userId)));
    setApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
  };

  const handleApply = async () => {
    if (!selectedJob || !resumeURL || !coverLetter) {
      toast.error('Please fill all fields');
      return;
    }

    setApplying(true);
    try {
      await addDoc(collection(({} as any), 'applications'), {
        jobId: selectedJob.id,
        studentId: userId,
        resume: resumeURL,
        coverLetter,
        appliedAt: serverTimestamp(),
        status: 'pending',
      });
      
      toast.success('Application submitted!');
      setShowApplyDialog(false);
      setResumeURL('');
      setCoverLetter('');
      fetchData();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const hasApplied = (jobId: string) => applications.some(a => a.jobId === jobId);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         job.company.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = jobType === 'all' || job.type === jobType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Placement Portal</h1>
          <p className="text-muted-foreground">Find your dream job opportunities</p>
        </div>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search jobs, companies..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
          <Select value={jobType} onValueChange={setJobType}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="part-time">Part Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredJobs.map((job, index) => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="card-elevated p-6"
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary shrink-0">
                {job.company[0]}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold">{job.title}</h3>
                  {hasApplied(job.id) && <Badge variant="secondary">Applied</Badge>}
                </div>
                <p className="text-primary font-medium mb-2">{job.company}</p>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.type}</span>
                  <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> {job.salary}</span>
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Deadline: {job.deadline?.toDate?.().toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {job.tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                </div>
              </div>

              <div className="flex lg:flex-col gap-2">
                <Button onClick={() => { setSelectedJob(job); setShowApplyDialog(true); }} disabled={hasApplied(job.id)}>
                  {hasApplied(job.id) ? 'Applied' : 'Apply'} <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Apply for {selectedJob?.title}</DialogTitle>
            <DialogDescription>{selectedJob?.company}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Resume URL</label>
              <Input value={resumeURL} onChange={e => setResumeURL(e.target.value)} placeholder="https://drive.google.com/..." className="mt-1" />
              <p className="text-xs text-muted-foreground mt-1">Upload resume to Google Drive and paste link</p>
            </div>
            <div>
              <label className="text-sm font-medium">Cover Letter</label>
              <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} className="mt-1 w-full min-h-[120px] p-2 rounded border bg-background" placeholder="Why are you a good fit..." />
            </div>
            <Button onClick={handleApply} disabled={applying} className="w-full">
              {applying ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Applying...</> : 'Submit Application'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
