import { useState, useEffect } from 'react';
import { exportUserListPDF } from '@/lib/pdfExport';
import PDFExportButton from '@/components/common/PDFExportButton';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  Building2,
  MapPin,
  Users,
  Clock,
  Plus,
  Search,
  Filter,
  MoreVertical,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Target,
  FileText,
  Download,
  ChevronRight,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

interface Drive {
  id: string;
  companyName: string;
  role: string;
  date: Timestamp;
  venue: string;
  eligibility: string;
  batch: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  description: string;
  registeredCount: number;
  contactPerson: string;
}

export default function PlacementDrives() {
  const { isPlacementOfficer, isAdmin } = usePermissions();
  const [drives, setDrives] = useState<Drive[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDrive, setEditingDrive] = useState<Drive | null>(null);

  const [formData, setFormData] = useState({
    companyName: '',
    role: '',
    date: '',
    venue: '',
    eligibility: '',
    batch: new Date().getFullYear().toString(),
    status: 'upcoming' as Drive['status'],
    description: '',
    contactPerson: '',
  });

  useEffect(() => {
    const q = query(collection(({} as any), 'placement_drives'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setDrives(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Drive)));
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        date: Timestamp.fromDate(new Date(formData.date)),
        updatedAt: serverTimestamp(),
      };

      if (editingDrive) {
        await updateDoc(doc(({} as any), 'placement_drives', editingDrive.id), data);
        toast.success('Drive updated successfully');
      } else {
        await addDoc(collection(({} as any), 'placement_drives'), {
          ...data,
          createdAt: serverTimestamp(),
          registeredCount: 0,
        });
        toast.success('Drive scheduled successfully');
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving drive:', error);
      toast.error('Failed to save drive');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this drive?')) return;
    try {
      await deleteDoc(doc(({} as any), 'placement_drives', id));
      toast.success('Drive deleted');
    } catch (error) {
      toast.error('Failed to delete drive');
    }
  };

  const exportDrives = () => {
    const data = filteredDrives.map(drive => ({
      Company: drive.companyName,
      Role: drive.role,
      Date: drive.date?.toDate ? drive.date.toDate().toLocaleDateString() : '',
      Venue: drive.venue,
      Eligibility: drive.eligibility,
      Batch: drive.batch,
      Status: drive.status,
      'Registered Count': drive.registeredCount
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Drives');
    XLSX.writeFile(workbook, `Placement_Drives_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Drives exported successfully');
  };

  const resetForm = () => {
    setFormData({
      companyName: '',
      role: '',
      date: '',
      venue: '',
      eligibility: '',
      batch: new Date().getFullYear().toString(),
      status: 'upcoming',
      description: '',
      contactPerson: '',
    });
    setEditingDrive(null);
  };

  const filteredDrives = drives.filter(drive => {
    const matchesSearch = drive.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         drive.role.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === 'all' || drive.status === filterStatus;
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
          <h1 className="text-2xl font-bold">Placement Drives</h1>
          <p className="text-muted-foreground">Monitor and manage campus recruitment events</p>
        </div>
        <div className="flex gap-2">
           <Button variant="outline" onClick={exportDrives}>
             <Download className="w-4 h-4 mr-2" />
             Export Excel
           </Button>
        {(isPlacementOfficer || isAdmin) && (
          <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button variant="gradient">
                <Plus className="w-4 h-4 mr-2" />
                Schedule Drive
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingDrive ? 'Edit Placement Drive' : 'Schedule New Drive'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <Input required value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} placeholder="e.g. Google India" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} placeholder="e.g. Software Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Date & Time</label>
                    <Input required type="datetime-local" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Venue</label>
                    <Input required value={formData.venue} onChange={e => setFormData({...formData, venue: e.target.value})} placeholder="e.g. Seminar Hall 1" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Eligibility</label>
                    <Input required value={formData.eligibility} onChange={e => setFormData({...formData, eligibility: e.target.value})} placeholder="e.g. 7.5 CGPA, No Backlogs" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Batch</label>
                    <Input required value={formData.batch} onChange={e => setFormData({...formData, batch: e.target.value})} placeholder="2025" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea 
                    className="w-full min-h-[100px] p-2 rounded-md border bg-background"
                    value={formData.description}
                    onChange={e => setFormData({...formData, description: e.target.value})}
                    placeholder="Job description, process details..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contact Person</label>
                    <Input value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} placeholder="HR Name / Contact" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <Select value={formData.status} onValueChange={(v: any) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="upcoming">Upcoming</SelectItem>
                        <SelectItem value="ongoing">Ongoing</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <Button type="submit" variant="gradient" className="w-full">
                  {editingDrive ? 'Update Drive' : 'Schedule Drive'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        )}
        </div>
      </div>

      <div className="card-elevated p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by company or role..." 
              className="pl-10"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drives</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredDrives.map((drive) => (
            <motion.div
              key={drive.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="card-elevated group p-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{drive.companyName}</h3>
                    <p className="text-sm font-medium text-primary">{drive.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={drive.status} />
                  {(isPlacementOfficer || isAdmin) && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => {
                          setEditingDrive(drive);
                          setFormData({
                            companyName: drive.companyName,
                            role: drive.role,
                            date: drive.date.toDate().toISOString().slice(0, 16),
                            venue: drive.venue,
                            eligibility: drive.eligibility,
                            batch: drive.batch,
                            status: drive.status,
                            description: drive.description,
                            contactPerson: drive.contactPerson || '',
                          });
                          setIsDialogOpen(true);
                        }}>Edit Drive</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(drive.id)}>Delete Drive</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{drive.date.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{drive.date.toDate().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span className="truncate">{drive.venue}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Target className="w-4 h-4" />
                    <span className="truncate">{drive.eligibility}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    <span>Batch {drive.batch}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-4 h-4" />
                    <span>{drive.registeredCount} Registered</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between gap-4 pt-4 border-t border-border/50">
                <p className="text-xs text-muted-foreground line-clamp-1 flex-1">
                  {drive.description || 'No additional details provided.'}
                </p>
                <Button variant="outline" size="sm" className="shrink-0">
                  Details
                  <ChevronRight className="w-3 h-3 ml-1" />
                </Button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Drive['status'] }) {
  const styles = {
    upcoming: 'bg-primary/10 text-primary border-primary/20',
    ongoing: 'bg-success/10 text-success border-success/20 animate-pulse',
    completed: 'bg-secondary text-muted-foreground border-border',
    cancelled: 'bg-destructive/10 text-destructive border-destructive/20',
  };

  return (
    <Badge variant="outline" className={cn("capitalize px-2 py-0", styles[status])}>
      {status === 'ongoing' && <span className="w-1.5 h-1.5 rounded-full bg-success mr-1.5" />}
      {status}
    </Badge>
  );
}
