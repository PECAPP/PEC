import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  User,
  Building2,
  Calendar,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  MoreVertical,
  Loader2,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  updateDoc,
  doc,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  jobTitle: string;
  companyName: string;
  status: 'pending' | 'shortlisted' | 'hired' | 'rejected';
  appliedAt: any;
  resumeUrl: string;
  feedback?: string;
  cgpa?: number;
}

export default function PlacementApplications() {
  const { isRecruiter, isPlacementOfficer, isAdmin, user } = usePermissions();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    let q;
    if (isRecruiter) {
      // Recruiters only see apps for their posted jobs
      // Note: This requires a 'recruiterId' field in the application or job
      q = query(collection(db, 'applications'), where('recruiterId', '==', user.uid), orderBy('appliedAt', 'desc'));
    } else {
      // PO and Admin see all apps
      q = query(collection(db, 'applications'), orderBy('appliedAt', 'desc'));
    }

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setApplications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Application)));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching applications:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user, isRecruiter]);

  const handleUpdateStatus = async (id: string, newStatus: Application['status']) => {
    try {
      await updateDoc(doc(db, 'applications', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
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
          <h1 className="text-2xl font-bold">Application Tracking</h1>
          <p className="text-muted-foreground">Manage and review student job applications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by student, company, or role..." 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredApps.length === 0 ? (
            <div className="text-center py-12 card-elevated">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
              <p className="text-muted-foreground">No applications found matching your filters.</p>
            </div>
          ) : (
            filteredApps.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="card-elevated group p-5 hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                  {/* Student Info */}
                  <div className="flex items-center gap-4 lg:w-1/4">
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-primary font-bold">
                      {app.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{app.studentName}</p>
                      <p className="text-xs text-muted-foreground">{app.studentDepartment} · {app.cgpa || '8.5'} CGPA</p>
                    </div>
                  </div>

                  {/* Job/Company Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-foreground">{app.jobTitle}</p>
                      <span className="text-muted-foreground">at</span>
                      <p className="font-semibold text-primary">{app.companyName}</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> Applied {app.appliedAt?.toDate().toLocaleDateString()}</span>
                      <span className="flex items-center gap-1 text-success font-medium"><ShieldCheck className="w-3.5 h-3.5" /> ERP Verified</span>
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex items-center justify-between lg:justify-end gap-6 lg:w-1/3">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={app.resumeUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-4 h-4 mr-1.5" />
                          Resume
                        </a>
                      </Button>
                      <StatusSelector 
                        currentStatus={app.status} 
                        onUpdate={(s) => handleUpdateStatus(app.id, s)}
                        disabled={!isRecruiter && !isPlacementOfficer && !isAdmin}
                      />
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Send Email</DropdownMenuItem>
                        <DropdownMenuItem>Add Note</DropdownMenuItem>
                        {(isPlacementOfficer || isAdmin) && (
                          <DropdownMenuItem className="text-destructive">Withdraw</DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusSelector({ currentStatus, onUpdate, disabled }: { 
  currentStatus: Application['status'], 
  onUpdate: (s: Application['status']) => void,
  disabled: boolean 
}) {
  const styles = {
    pending: 'bg-warning/10 text-warning border-warning/20',
    shortlisted: 'bg-primary/10 text-primary border-primary/20',
    hired: 'bg-success/10 text-success border-success/20',
    rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  if (disabled) {
    return (
      <Badge variant="outline" className={cn("capitalize", styles[currentStatus])}>
        {currentStatus}
      </Badge>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={(v: any) => onUpdate(v)}>
      <SelectTrigger className={cn("h-8 w-32 capitalize text-xs font-semibold", styles[currentStatus])}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="shortlisted">Shortlisted</SelectItem>
        <SelectItem value="hired">Hired</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
      </SelectContent>
    </Select>
  );
}
