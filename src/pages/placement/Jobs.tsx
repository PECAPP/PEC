import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  IndianRupee,
  Clock,
  Plus,
  Loader2,
  Building2,
  CheckCircle2,
  ChevronRight,
  MoreVertical,
  Trash2,
  Edit,
  Globe,
  Tag,
  FileText,
  Upload,
  Eye,
  Paperclip,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ImageWithBlur } from '@/components/ui/image-with-blur';
import { JobCardSkeleton } from '@/components/ui/skeletons';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Job {
  id: string;
  title: string;
  companyName: string;
  location: string;
  type: 'full-time' | 'internship' | 'part-time';
  salary: string;
  deadline: Timestamp;
  status: 'open' | 'closed';
  tags: string[];
  description: string;
  requirements: string;
  recruiterId: string;
  postedAt: any;
}

export default function Jobs() {
  const { isRecruiter, isPlacementOfficer, isAdmin, isStudent, user } = usePermissions();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [appliedJobIds, setAppliedJobIds] = useState<Set<string>>(new Set());

  // New Application Flow State
  const [applicationDialogOpen, setApplicationDialogOpen] = useState(false);
  const [confirmingJob, setConfirmingJob] = useState<Job | null>(null);
  const [hasResume, setHasResume] = useState(false);
  const [existingResumeUrl, setExistingResumeUrl] = useState<string | null>(null);
  const [useExistingResume, setUseExistingResume] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [isResumePublic, setIsResumePublic] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [studentProfile, setStudentProfile] = useState<any>(null); // To store full profile for verification

  useEffect(() => {
    // Check if user has a resume and profile when component loads
    const checkUserProfile = async () => {
      if (!user?.uid || isRecruiter) return;
      try {
        const profileRef = doc(({} as any), 'placementProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);
        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setStudentProfile(data);
          if (data.resumeUrl) {
            setHasResume(true);
            setExistingResumeUrl(data.resumeUrl);
            setUseExistingResume(true);
          }
          if (data.isResumePublic !== undefined) {
             setIsResumePublic(data.isResumePublic);
          }
        }
      } catch (err) {
        console.error("Error checking profile:", err);
      }
    };
    checkUserProfile();
  }, [user, isRecruiter]);

  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    location: '',
    type: 'full-time' as Job['type'],
    salary: '',
    deadline: '',
    tags: '',
    description: '',
    requirements: '',
    status: 'open' as Job['status'],
  });

  useEffect(() => {
    if (!user) return;

    let q;
    if (isRecruiter) {
      q = query(collection(({} as any), 'jobs'), where('recruiterId', '==', user.uid), orderBy('postedAt', 'desc'));
    } else {
      q = query(collection(({} as any), 'jobs'), orderBy('postedAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setJobs(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Job)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching jobs:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isRecruiter]);

  // Load user's applied jobs
  useEffect(() => {
    if (!user || isRecruiter) return;

    const loadAppliedJobs = async () => {
      try {
        const appQuery = query(
          collection(({} as any), 'applications'),
          where('studentId', '==', user.uid)
        );
        const snapshot = await getDocs(appQuery);
        const appliedIds = new Set(snapshot.docs.map(doc => doc.data().jobId));
        setAppliedJobIds(appliedIds);
      } catch (error) {
        console.error('Error loading applied jobs:', error);
      }
    };

    loadAppliedJobs();
  }, [user, isRecruiter]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        deadline: Timestamp.fromDate(new Date(formData.deadline)),
        updatedAt: serverTimestamp(),
      };

      if (editingJob) {
        await updateDoc(doc(({} as any), 'jobs', editingJob.id), data);
        toast.success('Job updated successfully');
      } else {
        await addDoc(collection(({} as any), 'jobs'), {
          ...data,
          recruiterId: user?.uid,
          postedAt: serverTimestamp(),
        });
        toast.success('Job posted successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save job');
    }
  };

  const handleApply = async (job: Job) => {
    if (!user) {
      toast.error('Please sign in to apply');
      return;
    }
    
    // Check if profile exists
    if (!studentProfile) {
       toast.error("Please complete your placement profile first!");
       return;
    }

    setConfirmingJob(job);
    setApplicationDialogOpen(true);
  };

  const processApplication = async () => {
    if (!confirmingJob || !user) return;
    
    // Resume Validation
    let resumeUrlToUse = existingResumeUrl;

    if (!useExistingResume || !hasResume) {
        if (!file) {
            toast.error("Please upload your resume to apply");
            return;
        }
        
        setUploading(true);
        try {
           // Simulate upload delay
           await new Promise(resolve => setTimeout(resolve, 1500));
           
           // Mock Upload URL
           resumeUrlToUse = `/media/resumes/${user.uid}_${Date.now()}.pdf`;
           
           // If they chose to make public, update their profile
           if (isResumePublic) {
               await updateDoc(doc(({} as any), 'placementProfiles', user.uid), {
                   resumeUrl: resumeUrlToUse,
                   resumeUpdatedAt: serverTimestamp(),
                   isResumePublic: true
               });
               // Update local state
               setHasResume(true);
               setExistingResumeUrl(resumeUrlToUse);
           }
        } catch (e) {
            console.error("Upload failed", e);
            toast.error("Failed to upload resume");
            setUploading(false);
            return;
        }
        setUploading(false);
    }

    setUploading(true);
    try {
      // Create application
      const applicationId = crypto.randomUUID();
      await setDoc(doc(({} as any), 'job_applications', applicationId), {
        id: applicationId,
        jobId: confirmingJob.id,
        jobTitle: confirmingJob.title || 'Untitled Position',
        companyName: confirmingJob.companyName || 'Unknown Company',
        studentId: user.uid,
        studentName: user.displayName || user.email?.split('@')[0] || 'Student',
        studentEmail: user.email,
        studentDepartment: (studentProfile as any).department || 'General',
        studentCgpa: (studentProfile as any).cgpa || 0,
        resumeUrl: resumeUrlToUse,
        status: 'applied',
        appliedAt: serverTimestamp(),
        lastUpdatedAt: serverTimestamp(),
        coverLetter: '', // Optional, could add field
        internalNotes: '',
      });

      setAppliedJobIds(prev => new Set(prev).add(confirmingJob.id));
      toast.success('Applied successfully!');
      setApplicationDialogOpen(false);
      setConfirmingJob(null);
      setFile(null);
    } catch (error) {
      console.error('Error applying:', error);
      toast.error('Failed to apply');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteDoc(doc(({} as any), 'jobs', id));
      toast.success('Job deleted');
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      companyName: '',
      location: '',
      type: 'full-time',
      salary: '',
      deadline: '',
      tags: '',
      description: '',
      requirements: '',
      status: 'open',
    });
    setEditingJob(null);
  };

  // Helper to get deterministic but nice images for jobs
  const getCompanyImage = (company: string, title: string) => {
      // If we had real logos in DB we'd use them.
      // For now, use Unsplash based on company or tech stack
      const keywords = `${company} ${title} office`;
      return `https://source.unsplash.com/random/200x200/?${encodeURIComponent(keywords)},logo,tech`;
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
           <div className="h-8 w-48 bg-muted animate-pulse rounded" />
           <div className="h-10 w-32 bg-muted animate-pulse rounded" />
        </div>
        <div className="space-y-4">
           {Array.from({length: 4}).map((_, i) => <JobCardSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Institutional Job Board</h1>
          <p className="text-muted-foreground">{isRecruiter ? 'Manage your postings and scout talent' : 'Discover and apply for verified opportunities'}</p>
        </div>
        {(isRecruiter || isPlacementOfficer || isAdmin) && (
          <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Post New Job
          </Button>
        )}
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by role, company, or skills..." 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="full-time">Full-Time</SelectItem>
              <SelectItem value="internship">Internship</SelectItem>
              <SelectItem value="part-time">Part-Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-20 card-elevated">
              <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-10" />
              <p className="text-xl font-medium text-muted-foreground">No opportunities listed yet.</p>
            </div>
          ) : (
            filteredJobs.map((job) => (
              <motion.div
                key={job.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="card-elevated group p-6 hover:shadow-lg hover:border-primary/20 transition-all border-l-4 border-l-primary/50"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden shrink-0 border border-border">
                     <ImageWithBlur
                        src={getCompanyImage(job.companyName, job.title)} 
                        alt={job.companyName}
                        className="w-full h-full object-cover"
                        fallbackColor="bg-secondary"
                     />
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-xl font-bold text-foreground">{job.title}</h3>
                      <Badge variant="secondary" className="capitalize">{job.type}</Badge>
                      {job.status === 'closed' && (
                        <Badge variant="destructive">Closed</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-primary font-semibold">
                      <Building2 className="w-4 h-4" />
                      {job.companyName}
                    </div>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground font-medium">
                      <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {job.location}</span>
                      <span className="flex items-center gap-1.5"><IndianRupee className="w-4 h-4" /> {job.salary}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> Apply by {job.deadline?.toDate().toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      {job.tags?.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[10px] px-2 py-0 h-5 border-primary/20 bg-primary/5 text-primary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="hover:bg-primary/5"
                      onClick={() => setSelectedJob(job)}
                    >
                      View Detail
                    </Button>
                    {isStudent && (
                      appliedJobIds.has(job.id) ? (
                        <Button 
                          size="lg" 
                          className="px-8 bg-green-600 hover:bg-green-700 text-white cursor-default"
                          disabled
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Applied
                        </Button>
                      ) : (
                        <Button 
                          size="lg" 
                          className="px-8 shadow-md hover:shadow-lg transition-all"
                          onClick={() => handleApply(job)}
                          disabled={job.status === 'closed'}
                        >
                          {job.status === 'closed' ? 'Closed' : 'Apply Now'}
                        </Button>
                      )
                    )}
                    {(isRecruiter || isPlacementOfficer || isAdmin) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-10 w-10">
                            <MoreVertical className="w-5 h-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => {
                            setEditingJob(job);
                            setFormData({
                              title: job.title,
                              companyName: job.companyName,
                              location: job.location,
                              type: job.type,
                              salary: job.salary,
                              deadline: job.deadline.toDate().toISOString().slice(0, 10),
                              tags: job.tags.join(', '),
                              description: job.description,
                              requirements: job.requirements,
                              status: job.status,
                            });
                            setIsDialogOpen(true);
                          }}>
                            <Edit className="w-4 h-4 mr-2" /> Edit Job
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(job.id)}>
                            <Trash2 className="w-4 h-4 mr-2" /> Delete Job
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-3xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{editingJob ? 'Update Job Posting' : 'Post Institutional Opportunity'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Title</label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="e.g. SDE-1 (Backend)" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Company Name</label>
                <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Google India" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Location</label>
                <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} placeholder="e.g. Bangalore / Remote" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Salary/Stipend</label>
                <Input required value={formData.salary} onChange={e => setFormData({...formData, salary: e.target.value})} placeholder="e.g. ₹15-20 LPA" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Job Type</label>
                <Select value={formData.type} onValueChange={(v: any) => setFormData({...formData, type: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">Full-Time</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                    <SelectItem value="part-time">Part-Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Application Deadline</label>
                <Input required type="date" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Skills/Tags (comma separated)</label>
                <Input value={formData.tags} onChange={e => setFormData({...formData, tags: e.target.value})} placeholder="React, Node.js, AWS" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Job Description</label>
              <textarea 
                className="w-full min-h-[120px] p-3 rounded-xl border bg-background font-sans text-sm"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder="Briefly describe the role and team..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold">Requirements</label>
              <textarea 
                className="w-full min-h-[120px] p-3 rounded-xl border bg-background font-sans text-sm"
                value={formData.requirements}
                onChange={e => setFormData({...formData, requirements: e.target.value})}
                placeholder="List key qualifications and expectations..."
              />
            </div>
            <Button type="submit" variant="gradient" className="w-full py-6 text-lg font-bold">
              {editingJob ? 'Update Posting' : 'Post Opportunity'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Job Detail Dialog */}
      <Dialog open={!!selectedJob} onOpenChange={(open) => !open && setSelectedJob(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedJob && (
            <>
              <DialogHeader>
                <div className="flex items-start gap-4">
                   <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 border border-border">
                     <ImageWithBlur
                        src={getCompanyImage(selectedJob.companyName, selectedJob.title)} 
                        alt={selectedJob.companyName}
                        className="w-full h-full object-cover"
                     />
                   </div>
                  <div className="flex-1">
                    <DialogTitle className="text-2xl">{selectedJob.title}</DialogTitle>
                    <p className="text-lg text-primary font-semibold">{selectedJob.companyName}</p>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 mt-4">
                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Location</p>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {selectedJob.location}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Package</p>
                    <p className="font-semibold flex items-center gap-1">
                      <IndianRupee className="w-4 h-4" />
                      {selectedJob.salary}
                    </p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="font-semibold capitalize">{selectedJob.type}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <p className="text-xs text-muted-foreground">Deadline</p>
                    <p className="font-semibold flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {selectedJob.deadline?.toDate().toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Skills/Tags */}
                {selectedJob.tags?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Skills Required</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedJob.tags.map(tag => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedJob.description && (
                  <div>
                    <h4 className="font-semibold mb-2">Job Description</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.description}</p>
                  </div>
                )}

                {/* Requirements */}
                {selectedJob.requirements && (
                  <div>
                    <h4 className="font-semibold mb-2">Requirements</h4>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedJob.requirements}</p>
                  </div>
                )}

                {/* Apply Button */}
                <div className="flex gap-3 pt-4 border-t">
                  {isStudent && (
                    appliedJobIds.has(selectedJob.id) ? (
                      <Button 
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white cursor-default" 
                        size="lg"
                        disabled
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Already Applied
                      </Button>
                    ) : (
                      <Button 
                        className="flex-1" 
                        size="lg"
                        onClick={() => {
                          handleApply(selectedJob);
                          setSelectedJob(null);
                        }}
                        disabled={selectedJob.status === 'closed'}
                      >
                        {selectedJob.status === 'closed' ? 'Position Closed' : 'Apply for this Position'}
                      </Button>
                    )
                  )}
                  <Button variant="outline" size="lg" onClick={() => setSelectedJob(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Dialog */}
      <Dialog open={applicationDialogOpen} onOpenChange={setApplicationDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Apply for {confirmingJob?.title}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg">
                <Building2 className="w-8 h-8 text-primary/80" />
                <div>
                    <p className="font-semibold text-sm">{confirmingJob?.companyName}</p>
                    <p className="text-xs text-muted-foreground">{confirmingJob?.location}</p>
                </div>
            </div>

            <div className="space-y-4">
                <label className="text-sm font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-primary" /> 
                    Resume Configuration
                </label>
                
                {hasResume ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-card/50">
                            <div className="h-10 w-10 flex items-center justify-center bg-red-100 rounded text-red-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">Current Resume</p>
                                <a 
                                  href={existingResumeUrl || '#'} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary hover:underline flex items-center gap-1"
                                >
                                    View <Eye className="w-3 h-3" />
                                </a>
                            </div>
                            <input 
                                type="radio" 
                                className="w-4 h-4 text-primary"
                                checked={useExistingResume}
                                onChange={() => setUseExistingResume(true)}
                            />
                        </div>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <div 
                            className={cn(
                                "border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors",
                                !useExistingResume ? "border-primary bg-primary/5" : "border-muted hover:border-primary/50"
                            )}
                            onClick={() => {
                                setUseExistingResume(false);
                                document.getElementById('resume-upload')?.click();
                            }}
                        >
                            <input 
                                type="file" 
                                id="resume-upload" 
                                className="hidden" 
                                accept=".pdf,.doc,.docx"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        setFile(e.target.files[0]);
                                        setUseExistingResume(false);
                                    }
                                }}
                            />
                            <div className="flex flex-col items-center gap-1">
                                <Upload className={cn("w-6 h-6", !useExistingResume ? "text-primary" : "text-muted-foreground")} />
                                <p className="text-sm font-medium">Upload New Resume</p>
                                {file && !useExistingResume && (
                                    <p className="text-xs text-green-600 font-medium mt-1 flex items-center gap-1">
                                        <CheckCircle2 className="w-3 h-3" />
                                        {file.name}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                     <div 
                        className="border-2 border-dashed border-primary/50 bg-primary/5 rounded-lg p-6 text-center cursor-pointer hover:bg-primary/10 transition-colors"
                        onClick={() => document.getElementById('resume-upload-required')?.click()}
                    >
                        <input 
                            type="file" 
                            id="resume-upload-required" 
                            className="hidden" 
                            accept=".pdf,.doc,.docx"
                            onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    setFile(e.target.files[0]);
                                    setUseExistingResume(false);
                                }
                            }}
                        />
                        <div className="flex flex-col items-center gap-2">
                            <div className="h-12 w-12 rounded-full bg-background flex items-center justify-center shadow-sm">
                                <Upload className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium">Upload Resume to Apply</p>
                                <p className="text-xs text-muted-foreground mt-1">PDF, DOC, DOCX (Max 5MB)</p>
                            </div>
                            {file && (
                                <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    {file.name} selected
                                </p>
                            )}
                        </div>
                    </div>
                )}
                
               {(!useExistingResume || !hasResume) && (
                   <div className="flex items-start gap-2 pt-2">
                       <input 
                         type="checkbox" 
                         id="make-public"
                         className="mt-1"
                         checked={isResumePublic}
                         onChange={(e) => setIsResumePublic(e.target.checked)}
                       />
                       <label htmlFor="make-public" className="text-sm leading-none cursor-pointer">
                           <span className="font-medium block">Make this resume public?</span>
                           <span className="text-xs text-muted-foreground">
                               Allow recruiters to discover your profile even if you don't apply.
                           </span>
                       </label>
                   </div>
               )}
            </div>

            <Button 
                onClick={processApplication} 
                disabled={uploading || (!useExistingResume && !file)}
                className="w-full py-6 text-lg"
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {file ? 'Uploading & Applying...' : 'Applying...'}
                    </>
                ) : (
                    'Confirm Application'
                )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
