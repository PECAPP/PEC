import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Calendar,
  Building2,
  User,
  MapPin,
  Loader2,
  Send,
  Eye,
  Download,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import type { Offer, CompensationDetails } from '@/types';

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

const statusConfig = {
  'pending': { label: 'Pending', color: 'bg-yellow-500', icon: Clock },
  'accepted': { label: 'Accepted', color: 'bg-green-500', icon: CheckCircle },
  'rejected': { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  'expired': { label: 'Expired', color: 'bg-gray-500', icon: Clock },
  'revoked': { label: 'Revoked', color: 'bg-red-700', icon: XCircle },
};

interface OfferWithDetails extends Offer {
  studentName?: string;
  studentEmail?: string;
}

export default function OfferManagement() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<OfferWithDetails[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferWithDetails | null>(null);
  const [filter, setFilter] = useState<string>('all');
  
  const [formData, setFormData] = useState({
    jobTitle: '',
    location: '',
    baseSalary: '',
    bonus: '',
    joiningBonus: '',
    joiningDate: '',
    offerValidTill: '',
    notes: '',
  });

  useEffect(() => {
    if (!user?.uid) return;

    // Mock data for demonstration
    setOffers([
      {
        id: '1',
        applicationId: 'app1',
        jobId: 'job1',
        studentId: 'student1',
        recruiterId: user.uid,
        studentName: 'Rahul Sharma',
        studentEmail: 'rahul@example.com',
        jobTitle: 'Software Engineer',
        companyName: 'TechCorp',
        location: 'Bangalore',
        compensation: {
          baseSalary: '15 LPA',
          bonus: '2 LPA',
          joiningBonus: '50,000',
          benefits: ['Health Insurance', 'Stock Options'],
        },
        joiningDate: '2026-07-01',
        offerValidTill: '2026-02-15',
        offeredAt: { toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        status: 'pending',
        createdAt: { toDate: () => new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
        updatedAt: { toDate: () => new Date() },
      },
      {
        id: '2',
        applicationId: 'app2',
        jobId: 'job1',
        studentId: 'student2',
        recruiterId: user.uid,
        studentName: 'Priya Patel',
        studentEmail: 'priya@example.com',
        jobTitle: 'Software Engineer',
        companyName: 'TechCorp',
        location: 'Bangalore',
        compensation: {
          baseSalary: '18 LPA',
          bonus: '3 LPA',
          benefits: ['Health Insurance', 'Stock Options', 'RSUs'],
        },
        joiningDate: '2026-07-01',
        offerValidTill: '2026-02-10',
        offeredAt: { toDate: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        status: 'accepted',
        respondedAt: { toDate: () => new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        createdAt: { toDate: () => new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        updatedAt: { toDate: () => new Date() },
      },
      {
        id: '3',
        applicationId: 'app3',
        jobId: 'job2',
        studentId: 'student3',
        recruiterId: user.uid,
        studentName: 'Amit Kumar',
        studentEmail: 'amit@example.com',
        jobTitle: 'Frontend Developer',
        companyName: 'TechCorp',
        location: 'Hyderabad',
        compensation: {
          baseSalary: '12 LPA',
          benefits: ['Health Insurance'],
        },
        joiningDate: '2026-07-15',
        offerValidTill: '2026-01-20',
        offeredAt: { toDate: () => new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        status: 'rejected',
        respondedAt: { toDate: () => new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        rejectionReason: 'Accepted another offer',
        createdAt: { toDate: () => new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        updatedAt: { toDate: () => new Date() },
      },
    ]);
    setLoading(false);
  }, [user?.uid]);

  const filteredOffers = filter === 'all' 
    ? offers 
    : offers.filter(o => o.status === filter);

  const stats = {
    total: offers.length,
    pending: offers.filter(o => o.status === 'pending').length,
    accepted: offers.filter(o => o.status === 'accepted').length,
    rejected: offers.filter(o => o.status === 'rejected').length,
  };

  const handleCreateOffer = async () => {
    toast.success('Offer created and sent to candidate');
    setDialogOpen(false);
    resetForm();
  };

  const handleRevokeOffer = (offerId: string) => {
    toast.success('Offer has been revoked');
  };

  const handleResendOffer = (offerId: string) => {
    toast.success('Offer reminder sent');
  };

  const resetForm = () => {
    setFormData({
      jobTitle: '',
      location: '',
      baseSalary: '',
      bonus: '',
      joiningBonus: '',
      joiningDate: '',
      offerValidTill: '',
      notes: '',
    });
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
          <h1 className="text-3xl font-bold text-foreground">Offer Management</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage job offers to candidates
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Offer
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Offers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accepted</p>
                <p className="text-2xl font-bold text-green-500">{stats.accepted}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-500">{stats.rejected}</p>
              </div>
              <XCircle className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item}>
        <Tabs value={filter} onValueChange={setFilter}>
          <TabsList>
            <TabsTrigger value="all">All ({offers.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>

          <TabsContent value={filter} className="mt-4">
            {filteredOffers.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                  <h3 className="font-semibold text-lg">No offers found</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    {filter === 'all' 
                      ? 'Create your first offer to get started'
                      : `No ${filter} offers to show`
                    }
                  </p>
                  {filter === 'all' && (
                    <Button className="mt-4" onClick={() => setDialogOpen(true)}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Offer
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredOffers.map((offer) => {
                  const status = statusConfig[offer.status];
                  const StatusIcon = status.icon;
                  
                  return (
                    <Card key={offer.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                          <div className="flex gap-4 flex-1">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                              <User className="w-6 h-6 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h3 className="font-semibold text-lg">{offer.studentName}</h3>
                                  <p className="text-sm text-muted-foreground">{offer.studentEmail}</p>
                                </div>
                                <Badge className={cn("text-white", status.color)}>
                                  <StatusIcon className="w-3 h-3 mr-1" />
                                  {status.label}
                                </Badge>
                              </div>

                              <Separator className="my-4" />

                              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                <div>
                                  <p className="text-xs text-muted-foreground">Position</p>
                                  <p className="font-medium">{offer.jobTitle}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Location</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {offer.location}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Package</p>
                                  <p className="font-medium text-green-600 flex items-center gap-1">
                                    <DollarSign className="w-3 h-3" />
                                    {offer.compensation.baseSalary}
                                    {offer.compensation.bonus && ` + ${offer.compensation.bonus}`}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-muted-foreground">Joining Date</p>
                                  <p className="font-medium flex items-center gap-1">
                                    <Calendar className="w-3 h-3" />
                                    {offer.joiningDate}
                                  </p>
                                </div>
                              </div>

                              {offer.compensation.benefits && offer.compensation.benefits.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {offer.compensation.benefits.map((benefit, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {benefit}
                                    </Badge>
                                  ))}
                                </div>
                              )}

                              {offer.rejectionReason && (
                                <div className="mt-3 p-3 rounded-lg bg-red-500/5 border border-red-500/20">
                                  <p className="text-sm text-red-600">
                                    <strong>Reason:</strong> {offer.rejectionReason}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                <p className="text-sm text-muted-foreground">
                                  Sent {offer.offeredAt?.toDate && formatDistanceToNow(offer.offeredAt.toDate(), { addSuffix: true })}
                                  {offer.status === 'pending' && ` · Valid till ${offer.offerValidTill}`}
                                </p>
                                <div className="flex gap-2">
                                  {offer.status === 'pending' && (
                                    <>
                                      <Button size="sm" variant="outline" onClick={() => handleResendOffer(offer.id)}>
                                        <Send className="w-4 h-4 mr-1" />
                                        Remind
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleRevokeOffer(offer.id)}>
                                        Revoke
                                      </Button>
                                    </>
                                  )}
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button size="icon" variant="ghost">
                                        <MoreVertical className="w-4 h-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Download className="w-4 h-4 mr-2" />
                                        Download Offer Letter
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </div>
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
        </Tabs>
      </motion.div>

      {/* Create Offer Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create Offer</DialogTitle>
            <DialogDescription>Send a job offer to a candidate</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Job Title *</Label>
                <Input 
                  placeholder="e.g., Software Engineer"
                  value={formData.jobTitle}
                  onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Location *</Label>
                <Input 
                  placeholder="e.g., Bangalore"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Base Salary *</Label>
                <Input 
                  placeholder="e.g., 15 LPA"
                  value={formData.baseSalary}
                  onChange={(e) => setFormData({ ...formData, baseSalary: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Annual Bonus</Label>
                <Input 
                  placeholder="e.g., 2 LPA"
                  value={formData.bonus}
                  onChange={(e) => setFormData({ ...formData, bonus: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Joining Bonus</Label>
                <Input 
                  placeholder="e.g., 50,000"
                  value={formData.joiningBonus}
                  onChange={(e) => setFormData({ ...formData, joiningBonus: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Joining Date *</Label>
                <Input 
                  type="date"
                  value={formData.joiningDate}
                  onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Offer Valid Till *</Label>
                <Input 
                  type="date"
                  value={formData.offerValidTill}
                  onChange={(e) => setFormData({ ...formData, offerValidTill: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Additional Notes</Label>
              <Textarea 
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateOffer}>
              <Send className="w-4 h-4 mr-2" />
              Send Offer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
