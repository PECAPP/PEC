import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Search,
  Filter,
  Plus,
  Users,
  MapPin,
  Briefcase,
  MoreVertical,
  CheckCircle,
  XCircle,
  Tag,
  Mail,
  Phone,
  Loader2,
  ExternalLink,
  Edit,
  Trash2,
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
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface RecruiterCompany {
  id: string;
  name: string;
  industry: string;
  location: string;
  description: string;
  website: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'verified' | 'pending' | 'blacklisted';
  totalHires: number;
  openJobs: number;
}

export default function Recruiters() {
  const { isPlacementOfficer, isAdmin } = usePermissions();
  const [companies, setCompanies] = useState<RecruiterCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<RecruiterCompany | null>(null);
  const [jobCounts, setJobCounts] = useState<Record<string, number>>({});
  const [hireCounts, setHireCounts] = useState<Record<string, number>>({});
  const [selectedCompanyHires, setSelectedCompanyHires] = useState<any[] | null>(null);
  const [isHiresModalOpen, setIsHiresModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    location: '',
    description: '',
    website: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    status: 'verified' as RecruiterCompany['status'],
  });

  useEffect(() => {
    const q = query(collection(({} as any), 'recruiter_companies'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RecruiterCompany));
      setCompanies(data);
      setLoading(false);
      
      // Auto-sync if empty to pull seeded users
      if (data.length === 0 && (isAdmin || isPlacementOfficer)) {
        syncRecruiters();
      }
    });
    return () => unsubscribe();
  }, [isAdmin, isPlacementOfficer]);

  useEffect(() => {
    const unsubJobs = onSnapshot(query(collection(({} as any), 'jobs'), where('status', '==', 'open')), (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const rid = doc.data().recruiterId;
        const cname = doc.data().companyName;
        if (rid) counts[rid] = (counts[rid] || 0) + 1;
        // Fallback for missing rid: match by company name if unique
        if (!rid && cname) counts[cname] = (counts[cname] || 0) + 1;
      });
      setJobCounts(counts);
    });

    const unsubHired = onSnapshot(query(collection(({} as any), 'applications'), where('status', '==', 'hired')), (snap) => {
      const counts: Record<string, number> = {};
      snap.docs.forEach(doc => {
        const rid = doc.data().recruiterId;
        const cname = doc.data().companyName;
        if (rid) counts[rid] = (counts[rid] || 0) + 1;
        if (!rid && cname) counts[cname] = (counts[cname] || 0) + 1;
      });
      setHireCounts(counts);
    });

    return () => { unsubJobs(); unsubHired(); };
  }, []);

  // Sync logic for seeded recruiters
  const [syncing, setSyncing] = useState(false);
  const syncRecruiters = async () => {
    setSyncing(true);
    try {
      const usersQ = query(collection(({} as any), 'users'), where('role', '==', 'recruiter'));
      const userSnap = await getDocs(usersQ);
      
      let syncedCount = 0;
      for (const userDoc of userSnap.docs) {
        const userData = userDoc.data();
        const existing = companies.find(c => c.contactEmail === userData.email);
        
        if (!existing) {
          await addDoc(collection(({} as any), 'recruiter_companies'), {
            name: userData.company || userData.fullName.split(' ')[0] + ' Corp',
            industry: 'Technology',
            location: 'India',
            description: `Recruitment partner: ${userData.fullName}`,
            website: 'https://pec.edu',
            contactPerson: userData.fullName,
            contactEmail: userData.email,
            contactPhone: '+91 0000000000',
            status: 'verified',
            totalHires: 0,
            openJobs: 0,
            uid: userDoc.id, // Link to user
            createdAt: serverTimestamp(),
          });
          syncedCount++;
        }
      }
      if (syncedCount > 0) toast.success(`Synced ${syncedCount} recruiters from database`);
    } catch (error) {
      console.error("Sync error:", error);
      toast.error('Failed to sync recruiters');
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCompany) {
        await updateDoc(doc(({} as any), 'recruiter_companies', editingCompany.id), {
          ...formData,
          updatedAt: serverTimestamp(),
        });
        toast.success('Company updated successfully');
      } else {
        await addDoc(collection(({} as any), 'recruiter_companies'), {
          ...formData,
          totalHires: 0,
          openJobs: 0,
          createdAt: serverTimestamp(),
        });
        toast.success('Company added successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save company');
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: RecruiterCompany['status']) => {
    try {
      await updateDoc(doc(({} as any), 'recruiter_companies', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Recruiter status updated to ${newStatus}`);
    } catch (error) {
      console.error('Update status error:', error);
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this company?')) return;
    try {
      await deleteDoc(doc(({} as any), 'recruiter_companies', id));
      toast.success('Company removed');
    } catch (error) {
      toast.error('Failed to remove company');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      industry: '',
      location: '',
      description: '',
      website: '',
      contactPerson: '',
      contactEmail: '',
      contactPhone: '',
      status: 'verified',
    });
    setEditingCompany(null);
  };

  const fetchHiresForCompany = async (company: any) => {
    setIsHiresModalOpen(true);
    setSelectedCompanyHires(null);
    try {
      const q = query(
        collection(({} as any), 'applications'), 
        where('status', '==', 'hired'),
        where('companyName', '==', company.name)
      );
      const snap = await getDocs(q);
      setSelectedCompanyHires(snap.docs.map(d => d.data()));
    } catch (error) {
      toast.error('Failed to fetch hires');
      setIsHiresModalOpen(false);
    }
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold text-foreground">External Recruiters</h1>
          <p className="text-muted-foreground">Manage recruiting companies and their college partnerships</p>
        </div>
        <div className="flex gap-2">
          {(isPlacementOfficer || isAdmin) && (
            <Button variant="outline" onClick={syncRecruiters} disabled={syncing}>
              {syncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Users className="w-4 h-4 mr-2" />}
              Sync Seeded
            </Button>
          )}
          {(isPlacementOfficer || isAdmin) && (
            <Button variant="gradient" onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Recruiter
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatItem label="Total Recruiters" value={companies.length.toString()} />
        <StatItem label="Verified Partners" value={companies.filter(c => c.status === 'verified').length.toString()} color="text-success" />
        <StatItem label="Total Hires" value={Object.values(hireCounts).reduce((a, b) => a + b, 0).toString()} color="text-accent" />
        <StatItem label="Total Openings" value={Object.values(jobCounts).reduce((a, b) => a + b, 0).toString()} color="text-primary" />
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by company name or industry..." 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="popLayout">
          {filteredCompanies.map((company) => (
            <motion.div
              key={company.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-elevated p-6 hover:border-primary/20 transition-all group"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-110">
                  <Building2 className="w-7 h-7" />
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-foreground">{company.name}</h3>
                    <StatusBadge status={company.status} />
                    {company.status === 'pending' && (isPlacementOfficer || isAdmin) && (
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-success h-auto p-0 font-bold"
                        onClick={() => handleUpdateStatus(company.id, 'verified')}
                      >
                        Verify Now
                      </Button>
                    )}
                  </div>
                  <p className="text-sm font-medium text-primary">{company.industry}</p>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-muted-foreground font-medium mt-2">
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {company.location}</span>
                    <button 
                      onClick={() => fetchHiresForCompany(company)}
                      className="flex items-center gap-1.5 hover:text-primary transition-colors cursor-pointer"
                    >
                      <Users className="w-4 h-4" /> {hireCounts[(company as any).uid] || hireCounts[company.name] || 0} Hires
                    </button>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="w-4 h-4" /> {jobCounts[(company as any).uid] || jobCounts[company.name] || 0} Open Jobs
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6 lg:border-l lg:pl-6 lg:w-1/4">
                  <div className="flex-1 text-right lg:text-left">
                    <p className="text-sm font-bold text-foreground">{company.contactPerson}</p>
                    <p className="text-xs text-muted-foreground">{company.contactEmail}</p>
                  </div>
                  {(isPlacementOfficer || isAdmin) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-5 h-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingCompany(company);
                          setFormData({
                            name: company.name,
                            industry: company.industry,
                            location: company.location,
                            description: company.description || '',
                            website: company.website || '',
                            contactPerson: company.contactPerson,
                            contactEmail: company.contactEmail,
                            contactPhone: company.contactPhone,
                            status: company.status,
                          });
                          setIsDialogOpen(true);
                        }}>Edit Company</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => fetchHiresForCompany(company)}>View Hire List</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => window.open(company.website)}>Visit Website</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(company.id)}>Remove Company</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Hire Detail Modal */}
      <Dialog open={isHiresModalOpen} onOpenChange={setIsHiresModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Recent Hires</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedCompanyHires ? (
              <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin" /></div>
            ) : selectedCompanyHires.length === 0 ? (
              <p className="text-center py-10 text-muted-foreground">No students hired yet by this company.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {selectedCompanyHires.map((hire, idx) => (
                  <div key={idx} className="p-4 rounded-xl border bg-secondary/30 flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {hire.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <p className="font-bold">{hire.studentName}</p>
                      <p className="text-sm text-muted-foreground">{hire.jobTitle}</p>
                      <p className="text-xs text-primary">{hire.studentDepartment}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingCompany ? 'Edit Recruiter' : 'Add New Recruiter'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Company Name</label>
                <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Industry</label>
                <Input required value={formData.industry} onChange={e => setFormData({...formData, industry: e.target.value})} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input required value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Website</label>
                <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Contact Person</label>
              <Input required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Email</label>
                <Input required type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Contact Phone</label>
                <Input required value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="verified">Verified Partner</SelectItem>
                  <SelectItem value="pending">Pending Verification</SelectItem>
                  <SelectItem value="blacklisted">Blacklisted</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" variant="gradient" className="w-full">
              {editingCompany ? 'Update Recruiter' : 'Add Recruiter'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatItem({ label, value, color }: { label: string, value: string, color?: string }) {
  return (
    <div className="card-elevated p-5">
      <p className={cn("text-3xl font-black", color || "text-foreground")}>{value}</p>
      <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: RecruiterCompany['status'] }) {
  const styles = {
    verified: 'bg-success/10 text-success border-success/20',
    pending: 'bg-warning/10 text-warning border-warning/20',
    blacklisted: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Badge variant="outline" className={cn("capitalize font-bold h-6", styles[status])}>
      {status === 'verified' && <CheckCircle className="w-3 h-3 mr-1" />}
      {status === 'blacklisted' && <XCircle className="w-3 h-3 mr-1" />}
      {status}
    </Badge>
  );
}
