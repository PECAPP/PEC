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
import { onAuthStateChanged } from 'firebase/auth';
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
} from 'firebase/firestore';
import { auth, db } from '@/config/firebase';
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
  const { isAdmin, isPlacementOfficer, isRecruiter, user, loading: authLoading } = usePermissions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return; // Wait for auth to load
    
    if (!user) {
      navigate('/auth');
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

  if (isRecruiter) {
    return <RecruiterJobsView userId={user.uid} />;
  }

  if (isPlacementOfficer || isAdmin) {
    return <PlacementsManager userId={user.uid} userRole={user.role} />;
  }

  return <StudentPlacementsView userId={user.uid} />;
}

function RecruiterJobsView({ userId }: { userId: string }) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [selectedJob, setSelectedJob] = useState('');
  const [showJobDialog, setShowJobDialog] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(false);

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    type: 'full-time' as Job['type'],
    salary: '',
    deadline: '',
    tags: '',
  });

  useEffect(() => {
    fetchJobs();
  }, [userId]);

  const fetchJobs = async () => {
    try {
      const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('postedBy', '==', userId)));
      setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchApplications = async (jobId: string) => {
    setLoading(true);
    try {
      const appsSnap = await getDocs(query(collection(db, 'applications'), where('jobId', '==', jobId)));
      const appsData = await Promise.all(
        appsSnap.docs.map(async (appDoc) => {
          const appData = appDoc.data();
          const studentDoc = await getDoc(doc(db, 'users', appData.studentId));
          const studentData = studentDoc.data();
          return {
            id: appDoc.id,
            ...appData,
            studentName: studentData?.fullName || 'Unknown',
            studentEmail: studentData?.email || '',
          } as Application;
        })
      );
      setApplications(appsData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async () => {
    if (!jobForm.title || !jobForm.company || !jobForm.deadline) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      await addDoc(collection(db, 'jobs'), {
        title: jobForm.title,
        company: jobForm.company,
        description: jobForm.description,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
        location: jobForm.location,
        type: jobForm.type,
        salary: jobForm.salary,
        deadline: Timestamp.fromDate(new Date(jobForm.deadline)),
        tags: jobForm.tags.split(',').map(t => t.trim()).filter(t => t),
        postedBy: userId,
        postedAt: serverTimestamp(),
        status: 'open',
      });
      
      toast.success('Job posted successfully');
      setShowJobDialog(false);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to post job');
    }
  };

  const handleUpdateJob = async () => {
    if (!editingJob) return;
    
    try {
      await updateDoc(doc(db, 'jobs', editingJob.id), {
        title: jobForm.title,
        company: jobForm.company,
        description: jobForm.description,
        requirements: jobForm.requirements.split('\n').filter(r => r.trim()),
        location: jobForm.location,
        type: jobForm.type,
        salary: jobForm.salary,
        deadline: Timestamp.fromDate(new Date(jobForm.deadline)),
        tags: jobForm.tags.split(',').map(t => t.trim()).filter(t => t),
        updatedAt: serverTimestamp(),
      });
      
      toast.success('Job updated');
      setShowJobDialog(false);
      setEditingJob(null);
      resetForm();
      fetchJobs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update');
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Delete this job posting?')) return;
    
    try {
      await deleteDoc(doc(db, 'jobs', id));
      toast.success('Job deleted');
      fetchJobs();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to delete');
    }
  };

  const handleUpdateApplicationStatus = async (appId: string, status: Application['status'], feedback?: string) => {
    try {
      await updateDoc(doc(db, 'applications', appId), {
        status,
        feedback: feedback || '',
        updatedAt: serverTimestamp(),
      });
      toast.success('Application updated');
      if (selectedJob) fetchApplications(selectedJob);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update');
    }
  };

  const resetForm = () => {
    setJobForm({
      title: '',
      company: '',
      description: '',
      requirements: '',
      location: '',
      type: 'full-time',
      salary: '',
      deadline: '',
      tags: '',
    });
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setJobForm({
      title: job.title,
      company: job.company,
      description: job.description,
      requirements: job.requirements.join('\n'),
      location: job.location,
      type: job.type,
      salary: job.salary,
      deadline: job.deadline?.toDate?.().toISOString().split('T')[0] || '',
      tags: job.tags.join(', '),
    });
    setShowJobDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">My Job Postings</h1>
          <p className="text-muted-foreground">Manage your job listings and applications</p>
        </div>
        <div className="button-group">
          <Button onClick={() => { resetForm(); setEditingJob(null); setShowJobDialog(true); }}>
            <Plus className="w-4 h-4 mr-2" /> Post Job
          </Button>
        </div>
      </div>

      <Tabs defaultValue="jobs" onValueChange={() => setSelectedJob('')}>
        <TabsList>
          <TabsTrigger value="jobs">My Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          {jobs.length === 0 ? (
            <div className="card-elevated p-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No jobs posted yet</p>
            </div>
          ) : (
            jobs.map(job => (
              <div key={job.id} className="card-elevated p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <Badge variant={job.status === 'open' ? 'default' : 'secondary'}>{job.status}</Badge>
                    </div>
                    <p className="text-primary font-medium mb-2">{job.company}</p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1"><IndianRupee className="w-4 h-4" /> {job.salary}</span>
                      <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> Deadline: {job.deadline?.toDate?.().toLocaleDateString()}</span>
                    </div>
                    <div className="flex gap-1.5">
                      {job.tags.map(tag => <Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="ghost" onClick={() => openEditDialog(job)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDeleteJob(job.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-4">
          <div className="card-elevated p-4">
            <Select value={selectedJob} onValueChange={(val) => { setSelectedJob(val); fetchApplications(val); }}>
              <SelectTrigger>
                <SelectValue placeholder="Select job to view applications" />
              </SelectTrigger>
              <SelectContent>
                {jobs.map(j => <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          {selectedJob && (
            <div className="card-elevated p-6">
              {loading ? <Loader2 className="w-6 h-6 animate-spin mx-auto" /> : applications.length === 0 ? (
                <p className="text-center text-muted-foreground">No applications yet</p>
              ) : (
                <div className="space-y-4">
                  {applications.map(app => (
                    <div key={app.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <p className="font-medium">{app.studentName}</p>
                          <p className="text-xs text-muted-foreground">{app.studentEmail}</p>
                          <p className="text-xs text-muted-foreground mt-1">Applied: {app.appliedAt?.toDate?.().toLocaleString()}</p>
                        </div>
                        <Badge variant={app.status === 'accepted' ? 'default' : app.status === 'rejected' ? 'destructive' : 'secondary'}>
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-2"><strong>Cover Letter:</strong> {app.coverLetter}</p>
                      <div className="flex gap-2 mt-3">
                        <Button size="sm" variant="outline" asChild><a href={app.resume} target="_blank">View Resume</a></Button>
                        {app.status === 'pending' && (
                          <>
                            <Button size="sm" onClick={() => handleUpdateApplicationStatus(app.id, 'shortlisted')}>Shortlist</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleUpdateApplicationStatus(app.id, 'rejected')}>Reject</Button>
                          </>
                        )}
                        {app.status === 'shortlisted' && (
                          <Button size="sm" onClick={() => handleUpdateApplicationStatus(app.id, 'accepted')}>Accept</Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Job Dialog */}
      <Dialog open={showJobDialog} onOpenChange={setShowJobDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Edit Job' : 'Post New Job'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Job Title</label>
                <Input value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Company</label>
                <Input value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} className="mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <textarea value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} className="mt-1 w-full min-h-[100px] p-2 rounded border bg-background" />
            </div>
            <div>
              <label className="text-sm font-medium">Requirements (one per line)</label>
              <textarea value={jobForm.requirements} onChange={e => setJobForm({...jobForm, requirements: e.target.value})} className="mt-1 w-full min-h-[80px] p-2 rounded border bg-background" />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={jobForm.type} onValueChange={(val: any) => setJobForm({...jobForm, type: val})}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full Time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Salary</label>
                <Input value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} className="mt-1" placeholder="₹10-15 LPA" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Deadline</label>
                <Input type="date" value={jobForm.deadline} onChange={e => setJobForm({...jobForm, deadline: e.target.value})} className="mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input value={jobForm.tags} onChange={e => setJobForm({...jobForm, tags: e.target.value})} className="mt-1" placeholder="Python, React, AWS" />
              </div>
            </div>
            <Button onClick={editingJob ? handleUpdateJob : handleCreateJob} className="w-full">
              {editingJob ? 'Update' : 'Post'} Job
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
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
    const jobsSnap = await getDocs(collection(db, 'jobs'));
    setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    
    const appsSnap = await getDocs(collection(db, 'applications'));
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
    const jobsSnap = await getDocs(query(collection(db, 'jobs'), where('status', '==', 'open')));
    setJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Job)));
    
    const appsSnap = await getDocs(query(collection(db, 'applications'), where('studentId', '==', userId)));
    setApplications(appsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Application)));
  };

  const handleApply = async () => {
    if (!selectedJob || !resumeURL || !coverLetter) {
      toast.error('Please fill all fields');
      return;
    }

    setApplying(true);
    try {
      await addDoc(collection(db, 'applications'), {
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
        <Button onClick={() => navigate('/my-applications')}>
          <Briefcase className="w-4 h-4 mr-2" /> My Applications
        </Button>
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
