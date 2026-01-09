import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  DollarSign,
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
import { db } from '@/config/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
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
  const { isRecruiter, isPlacementOfficer, isAdmin, user } = usePermissions();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

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
      q = query(collection(db, 'jobs'), where('recruiterId', '==', user.uid), orderBy('postedAt', 'desc'));
    } else {
      q = query(collection(db, 'jobs'), orderBy('postedAt', 'desc'));
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
        await updateDoc(doc(db, 'jobs', editingJob.id), data);
        toast.success('Job updated successfully');
      } else {
        await addDoc(collection(db, 'jobs'), {
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
      toast.error('Please login to apply');
      return;
    }
    
    try {
      // Check if already applied
      const q = query(
        collection(db, 'applications'), 
        where('jobId', '==', job.id),
        where('studentId', '==', user.uid)
      );
      const snapshot = await getDocs(q);
      
      if (!snapshot.empty) {
        toast.error('You have already applied for this position');
        return;
      }

      await addDoc(collection(db, 'applications'), {
        jobId: job.id,
        jobTitle: job.title || 'Untitled Position',
        companyName: job.companyName || 'Unknown Company',
        studentId: user.uid,
        studentName: user.fullName || 'Student',
        studentEmail: user.email || '',
        studentDepartment: (user as any).department || 'General',
        status: 'pending',
        appliedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        recruiterId: job.recruiterId || '',
      });
      
      toast.success(`Successfully applied to ${job.companyName || 'the position'}`);
    } catch (error) {
      console.error("Error applying:", error);
      toast.error('Failed to submit application');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job posting?')) return;
    try {
      await deleteDoc(doc(db, 'jobs', id));
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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.companyName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'all' || job.type === typeFilter;
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary font-bold text-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    {job.companyName?.[0] || 'J'}
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
                      <span className="flex items-center gap-1.5"><DollarSign className="w-4 h-4" /> {job.salary}</span>
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
                    <Button variant="outline" size="lg" className="hover:bg-primary/5 hidden lg:flex">
                      View Detail
                    </Button>
                    <Button 
                      size="lg" 
                      className="px-8 shadow-md hover:shadow-lg transition-all"
                      onClick={() => handleApply(job)}
                      disabled={job.status === 'closed'}
                    >
                      {job.status === 'closed' ? 'Closed' : 'Apply Now'}
                    </Button>
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
    </div>
  );
}
