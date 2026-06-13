'use client';
import { Button, Input, Textarea, Badge, Tabs, TabsList, TabsTrigger, Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, formatDate, PageBanner } from "@pec/ui";
import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Home, Plus, Clock, CheckCircle2, AlertCircle, MessageSquare, Send,
  Wrench, Zap, Droplets, Wifi, ThermometerSun, Loader2, RefreshCw, Upload, X, QrCode, Ticket
} from 'lucide-react';

import { toast } from 'sonner';
import { extractData, cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import api from "@pec/api";
import { useOfflineSync } from '../hooks/useOfflineSync';
import { HostelIssue } from "../types";

const categoryIcons: Record<string, any> = {
  electrical: Zap,
  plumbing: Droplets,
  internet: Wifi,
  maintenance: Wrench,
  hvac: ThermometerSun,
};

const normalizeStatus = (status: string) => {
  if (!status) return 'pending';
  const s = status.toLowerCase();
  if (s === 'open') return 'pending';
  if (s === 'in_progress') return 'assigned';
  return s;
};

const getStatusConfig = (status: string) => {
  switch (normalizeStatus(status)) {
    case 'pending': return { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Pending' };
    case 'assigned': return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'Assigned' };
    case 'resolved': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Resolved' };
    case 'closed': return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Closed' };
    case 'approved': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Approved' };
    case 'rejected': return { color: 'text-red-500', bg: 'bg-red-500/10', label: 'Rejected' };
    case 'active': return { color: 'text-primary', bg: 'bg-primary/10', label: 'Active' };
    case 'completed': return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Completed' };
    default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: status || 'Unknown' };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'emergency': case 'urgent': return { color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'high': return { color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'medium': return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
    default: return { color: 'text-green-500', bg: 'bg-green-500/10' };
  }
};

export default function StudentHostelView() {
  const { user } = usePermissions();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('issues_all');
  const [selectedIssue, setSelectedIssue] = useState<HostelIssue | null>(null);
  const [selectedOutpass, setSelectedOutpass] = useState<any | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [outpassDialogOpen, setOutpassDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    roomNumber: '',
    images: [] as string[],
  });

  const [outpassForm, setOutpassForm] = useState({
    destination: '',
    reason: '',
    departureDate: '',
    returnDate: '',
    roomNumber: '',
    hostelName: 'Boys Hostel 1',
  });

  // Offline Sync setup
  const { isOnline, queuedRequests, addToQueue } = useOfflineSync(async (req) => {
    if (req.method === 'POST') await api.post(req.url, req.payload);
    else if (req.method === 'PATCH') await api.patch(req.url, req.payload);
    await fetchData();
  });

  const compressImageToWebP = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 800;
          if (width > height && width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          } else if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/webp', 0.8));
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = [];
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        if (file.type.startsWith('image/')) {
          const webp = await compressImageToWebP(file);
          newImages.push(webp);
        }
      }
      setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
    }
  };

  const formatDate = (value: unknown) => {
    if (!value) return 'N/A';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return 'N/A';
    return formatDate(date);
  };

  const formatTime = (value: unknown) => {
    if (!value) return 'N/A';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString();
  };

  const fetchData = async () => {
    if (!user?.uid || authFailed || !isOnline) return;

    try {
      setLoading(true);
      const [issuesRes, outpassesRes] = await Promise.all([
        api.get('/hostelIssues', { params: { studentId: user.uid, limit: 100 } }),
        api.get('/hostelOutpass', { params: { studentId: user.uid, limit: 100 } })
      ]);
      
      setIssues(Array.isArray(extractData(issuesRes.data)) ? extractData(issuesRes.data) : []);
      setOutpasses(Array.isArray(extractData(outpassesRes.data)) ? extractData(outpassesRes.data) : []);
      setAuthFailed(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setAuthFailed(true);
        return;
      }
      console.error('Error fetching data:', error);
      toast.error('Failed to load hostel data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, authFailed, isOnline]);

  const handleSubmitIssue = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.roomNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.uid) return;
    setSubmitting(true);

    const payload = {
      title: formData.title,
      description: formData.description,
      category: formData.category,
      priority: formData.priority,
      roomNumber: formData.roomNumber,
      images: formData.images,
      studentId: user.uid,
      studentName: user.fullName || user.name || user.email?.split('@')[0] || 'Student',
      status: 'pending',
    };

    if (!isOnline) {
      addToQueue('/hostelIssues', 'POST', payload);
      setFormData({ title: '', description: '', category: 'electrical', priority: 'medium', roomNumber: '', images: [] });
      setDialogOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/hostelIssues', payload);
      setFormData({ title: '', description: '', category: 'electrical', priority: 'medium', roomNumber: '', images: [] });
      setDialogOpen(false);
      toast.success('Issue reported successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast.error(error.response?.data?.message || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitOutpass = async () => {
    if (!outpassForm.destination || !outpassForm.reason || !outpassForm.departureDate || !outpassForm.returnDate || !outpassForm.roomNumber) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    if (new Date(outpassForm.departureDate) >= new Date(outpassForm.returnDate)) {
      toast.error('Return date must be after departure date');
      return;
    }

    if (!user?.uid) return;
    setSubmitting(true);

    const payload = {
      ...outpassForm,
      studentId: user.uid,
      studentName: user.fullName || user.name || user.email?.split('@')[0] || 'Student',
      status: 'Pending',
    };

    if (!isOnline) {
      addToQueue('/hostelOutpass', 'POST', payload);
      setOutpassForm({ destination: '', reason: '', departureDate: '', returnDate: '', roomNumber: '', hostelName: 'Boys Hostel 1' });
      setOutpassDialogOpen(false);
      setSubmitting(false);
      return;
    }

    try {
      await api.post('/hostelOutpass', payload);
      setOutpassForm({ destination: '', reason: '', departureDate: '', returnDate: '', roomNumber: '', hostelName: 'Boys Hostel 1' });
      setOutpassDialogOpen(false);
      toast.success('Outpass requested successfully!');
      fetchData();
    } catch (error: any) {
      console.error('Error submitting outpass:', error);
      toast.error('Failed to submit outpass');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!newMessage.trim() || !selectedIssue) return;
    setSendingMessage(true);
    
    const payload = {
      responses: {
        _op: 'arrayUnion',
        val: { from: 'Student', message: newMessage, timestamp: new Date().toISOString() },
      },
    };

    if (!isOnline) {
      addToQueue(`/hostelIssues/${selectedIssue.id}`, 'PATCH', payload);
      setNewMessage('');
      setSendingMessage(false);
      return;
    }

    try {
      const response = await api.patch(`/hostelIssues/${selectedIssue.id}`, payload);
      if (response.data?.data) {
        setSelectedIssue(response.data.data);
        setNewMessage('');
        toast.success('Message sent!');
        fetchData();
      }
    } catch (error: any) {
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredIssues = issues.filter((issue) => {
    if (activeTab === 'issues_all') return true;
    return normalizeStatus(issue.status) === activeTab.replace('issues_', '');
  });

  const stats = {
    total: issues.length,
    open: issues.filter((i) => normalizeStatus(i.status) === 'pending').length,
    resolved: issues.filter((i) => ['resolved', 'closed'].includes(normalizeStatus(i.status))).length,
    outpasses: outpasses.length,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin  text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <PageBanner
          title={
            <div className="flex items-center gap-2">
              Hostel Management
              {!isOnline && <Badge variant="destructive" className="ml-2">Offline Mode</Badge>}
              {queuedRequests.length > 0 && <Badge variant="secondary" className="ml-2">{queuedRequests.length} Queued</Badge>}
            </div>
          }
          subtitle="Report issues and request outpasses"
          badgeText="Student Life"
          actions={
            <div className="flex gap-2 flex-wrap">
              <Button variant="outline" size="sm" onClick={fetchData} disabled={loading || !isOnline}>
                <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
                Refresh
              </Button>
              {/* Outpass Request Dialog */}
              <Dialog open={outpassDialogOpen} onOpenChange={setOutpassDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Ticket className="w-4 h-4 mr-2" />
                Request Outpass
              </Button>
            </DialogTrigger>
            <DialogContent className="">
              <DialogHeader>
                <DialogTitle>Request Outpass</DialogTitle>
                <DialogDescription>Submit a request to leave the hostel premises.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Hostel Name</label>
                    <Input value={outpassForm.hostelName} onChange={e => setOutpassForm({...outpassForm, hostelName: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Room Number</label>
                    <Input placeholder="e.g. A-204" value={outpassForm.roomNumber} onChange={e => setOutpassForm({...outpassForm, roomNumber: e.target.value})} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Destination</label>
                  <Input placeholder="Where are you going?" value={outpassForm.destination} onChange={e => setOutpassForm({...outpassForm, destination: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Reason</label>
                  <Textarea placeholder="Why are you leaving?" rows={2} value={outpassForm.reason} onChange={e => setOutpassForm({...outpassForm, reason: e.target.value})} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Departure</label>
                    <Input type="datetime-local" value={outpassForm.departureDate} onChange={e => setOutpassForm({...outpassForm, departureDate: e.target.value})} />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Return</label>
                    <Input type="datetime-local" value={outpassForm.returnDate} onChange={e => setOutpassForm({...outpassForm, returnDate: e.target.value})} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleSubmitOutpass} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Submit Request'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Issue Report Dialog */}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className=" max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
                <DialogDescription>Describe the issue in your room.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Title *</label>
                  <Input placeholder="e.g., Light bulb not working" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Room Number *</label>
                    <Input placeholder="e.g., A-204" value={formData.roomNumber} onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })} />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Category *</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electrical">Electrical</SelectItem>
                        <SelectItem value="plumbing">Plumbing</SelectItem>
                        <SelectItem value="internet">Internet/WiFi</SelectItem>
                        <SelectItem value="hvac">AC/Heating</SelectItem>
                        <SelectItem value="maintenance">General Maintenance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({ ...formData, priority: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description *</label>
                  <Textarea placeholder="Provide details..." value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
                </div>
                
                {/* Image Upload */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Photo Evidence</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-16 h-16 rounded-sm overflow-hidden border border-border">
                        <img src={img} alt="Evidence" className="w-full h-full object-cover" />
                        <button onClick={() => setFormData(p => ({...p, images: p.images.filter((_, idx) => idx !== i)}))} className="absolute top-0 right-0 bg-black/50 text-white p-0.5 rounded-bl-md hover:bg-black/80">
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {formData.images.length < 3 && (
                      <button onClick={() => fileInputRef.current?.click()} className="w-16 h-16 rounded-sm border border-dashed border-muted-foreground/30 flex items-center justify-center text-muted-foreground hover:bg-muted/50 transition-colors">
                        <Upload className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                  <input type="file" ref={fileInputRef} className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                  <p className="text-xs text-muted-foreground">Attach up to 3 photos (auto-compressed)</p>
                </div>

                <Button className="w-full" onClick={handleSubmitIssue} disabled={submitting}>
                  {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : 'Submit Issue'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
            </div>
          }
        />
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-primary/10"><Home className="w-5 h-5 text-primary" /></div>
            <div><p className="text-sm text-muted-foreground">Total Issues</p><p className="text-2xl font-bold text-foreground">{stats.total}</p></div>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-warning/10"><AlertCircle className="w-5 h-5 text-warning" /></div>
            <div><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-foreground">{stats.open}</p></div>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-success/10"><CheckCircle2 className="w-5 h-5 text-success" /></div>
            <div><p className="text-sm text-muted-foreground">Resolved</p><p className="text-2xl font-bold text-foreground">{stats.resolved}</p></div>
          </div>
        </div>
        <div className="bg-card border border-border/40 rounded-sm shadow-sm p-3 md:p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-sm bg-indigo-500/10"><Ticket className="w-5 h-5 text-indigo-500" /></div>
            <div><p className="text-sm text-muted-foreground">Outpasses</p><p className="text-2xl font-bold text-foreground">{stats.outpasses}</p></div>
          </div>
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-sm shadow-sm overflow-hidden">
        <Tabs value={activeTab.startsWith('issues') ? 'issues' : 'outpasses'} onValueChange={v => setActiveTab(v === 'issues' ? 'issues_all' : 'outpasses')}>
          <div className="px-4 pt-4 border-b border-border">
            <TabsList>
              <TabsTrigger value="issues" className="gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" /> Hostel Issues
              </TabsTrigger>
              <TabsTrigger value="outpasses" className="gap-1.5">
                <Ticket className="w-3.5 h-3.5" /> Digital Outpasses
              </TabsTrigger>
            </TabsList>
          </div>

          {activeTab.startsWith('issues') && (
            <div className="grid gap-6 lg:grid-cols-5 p-4">
              <div className="lg:col-span-2 flex flex-col h-[600px] border border-border rounded-sm overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <TabsList className="mb-6">
                    <TabsTrigger value="issues_all" className="flex-1 gap-1.5">
                      <Home className="w-3.5 h-3.5" /> All
                    </TabsTrigger>
                    <TabsTrigger value="issues_pending" className="flex-1 gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Pending
                    </TabsTrigger>
                    <TabsTrigger value="issues_assigned" className="flex-1 gap-1.5">
                      <Wrench className="w-3.5 h-3.5" /> Assigned
                    </TabsTrigger>
                    <TabsTrigger value="issues_resolved" className="flex-1 gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Resolved
                    </TabsTrigger>
                  </TabsList>
                  <div className="flex-1 overflow-y-auto divide-y divide-border">
                    {loading ? (
                      <div className="text-center py-4 md:py-8"><Loader2 className="w-8 h-8 animate-spin  text-muted-foreground" /></div>
                    ) : filteredIssues.length === 0 ? (
                      <div className="text-center py-12"><Home className="w-12 h-12  text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No issues found</p></div>
                    ) : (
                      filteredIssues.map((issue) => {
                        const statusConfig = getStatusConfig(issue.status);
                        const priorityConfig = getPriorityConfig(issue.priority);
                        const CategoryIcon = categoryIcons[issue.category] || Wrench;
                        return (
                          <div key={issue.id} className={cn('p-4 hover:bg-muted/30 cursor-pointer', selectedIssue?.id === issue.id && 'bg-muted/50')} onClick={() => { setSelectedIssue(issue); setSelectedOutpass(null); }}>
                            <div className="flex items-start gap-3">
                              <div className={cn('p-2 rounded-sm', priorityConfig.bg)}><CategoryIcon className={cn('w-4 h-4', priorityConfig.color)} /></div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium text-foreground truncate">{issue.title}</h3>
                                <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0 text-xs')}>{statusConfig.label}</Badge>
                                  <span className="text-xs text-muted-foreground">{formatDate(issue.createdAt)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Tabs>
              </div>

              {/* Issue Details Panel */}
              <div className="lg:col-span-3">
                {selectedIssue ? (
                  <div className="h-full flex flex-col border border-border rounded-sm bg-card">
                    <div className="p-3 md:p-6 border-b border-border">
                      <div className="flex items-start justify-between">
                        <div>
                          <h2 className="text-lg font-semibold">{selectedIssue.title}</h2>
                          <p className="text-sm text-muted-foreground mt-1">Room: {selectedIssue.roomNumber} • {selectedIssue.category}</p>
                        </div>
                        <Badge className={cn(getStatusConfig(selectedIssue.status).bg, getStatusConfig(selectedIssue.status).color, 'border-0')}>{getStatusConfig(selectedIssue.status).label}</Badge>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">{selectedIssue.description}</p>
                      {selectedIssue.images && selectedIssue.images.length > 0 && (
                        <div className="mt-4 flex gap-2 overflow-x-auto">
                          {selectedIssue.images.map((img: string, i: number) => (
                            <a href={img} target="_blank" rel="noreferrer" key={i}>
                              <img src={img} alt="evidence" className="h-20 w-20 object-cover rounded-sm border border-border hover:opacity-80 transition-opacity" />
                            </a>
                          ))}
                        </div>
                      )}
                      {selectedIssue.isEscalated && (
                        <div className="mt-4 flex items-center gap-2 text-red-500 bg-red-500/10 p-2 rounded text-sm">
                          <AlertCircle className="w-4 h-4" /> This issue has missed its SLA deadline and has been escalated!
                        </div>
                      )}
                    </div>
                    <div className="flex-1 p-3 md:p-6 overflow-y-auto">
                      <h3 className="font-medium mb-4">Messages</h3>
                      {selectedIssue.responses && selectedIssue.responses.length > 0 ? (
                        <div className="space-y-4">
                          {selectedIssue.responses.map((response: any, i: number) => (
                            <div key={i} className={cn('p-4 rounded-sm max-w-[80%]', response.from === 'Student' ? 'ml-auto bg-primary/10' : 'bg-muted')}>
                              <div className="flex items-center justify-between mb-1"><span className="text-sm font-medium">{response.from}</span><span className="text-xs text-muted-foreground">{formatTime(response.timestamp)}</span></div>
                              <p className="text-sm">{response.message}</p>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-center text-muted-foreground py-4 md:py-8">No messages yet</p>}
                    </div>
                    {selectedIssue.status !== 'closed' && (
                      <div className="p-4 border-t border-border flex gap-2">
                        <Input placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleAddResponse()} disabled={sendingMessage} />
                        <Button onClick={handleAddResponse} disabled={sendingMessage}>{sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}</Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[600px] flex items-center justify-center border border-border rounded-sm bg-card/50">
                    <p className="text-muted-foreground">Select an issue to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'outpasses' && (
            <div className="grid gap-6 lg:grid-cols-5 p-4">
              <div className="lg:col-span-2 flex flex-col h-[600px] border border-border rounded-sm overflow-y-auto divide-y divide-border">
                {outpasses.length === 0 ? (
                  <div className="text-center py-12"><Ticket className="w-12 h-12  text-muted-foreground/50 mb-4" /><p className="text-muted-foreground">No outpasses found</p></div>
                ) : (
                  outpasses.map((outpass) => {
                    const statusConfig = getStatusConfig(outpass.status);
                    return (
                      <div key={outpass.id} className={cn('p-4 hover:bg-muted/30 cursor-pointer', selectedOutpass?.id === outpass.id && 'bg-muted/50')} onClick={() => { setSelectedOutpass(outpass); setSelectedIssue(null); }}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-foreground">{outpass.destination}</h3>
                            <p className="text-xs text-muted-foreground mt-1">{formatDate(outpass.departureDate)} - {formatDate(outpass.returnDate)}</p>
                          </div>
                          <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0')}>{statusConfig.label}</Badge>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className="lg:col-span-3">
                {selectedOutpass ? (
                  <div className="h-full flex flex-col border border-border rounded-sm bg-card p-3 md:p-6">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedOutpass.destination}</h2>
                        <Badge className={cn('mt-2 border-0', getStatusConfig(selectedOutpass.status).bg, getStatusConfig(selectedOutpass.status).color)}>{getStatusConfig(selectedOutpass.status).label}</Badge>
                      </div>
                      {selectedOutpass.status === 'Approved' && selectedOutpass.qrCode && (
                        <div className="bg-white p-2 rounded-sm border border-border shadow-sm flex flex-col items-center">
                          {/* Placeholder for actual QR code, we just display the hash string for now or a generic QR icon */}
                          <QrCode className="w-16 h-16 text-black" />
                          <span className="text-[10px] text-muted-foreground font-mono mt-1">{selectedOutpass.qrCode.slice(0,8)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4 text-sm bg-muted/30 p-4 rounded-sm">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-muted-foreground mb-1">Departure</p>
                          <p className="font-medium">{formatDate(selectedOutpass.departureDate)} {formatTime(selectedOutpass.departureDate)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground mb-1">Return</p>
                          <p className="font-medium">{formatDate(selectedOutpass.returnDate)} {formatTime(selectedOutpass.returnDate)}</p>
                        </div>
                      </div>
                      <div className="pt-4 border-t border-border">
                        <p className="text-muted-foreground mb-1">Reason</p>
                        <p>{selectedOutpass.reason}</p>
                      </div>
                      {selectedOutpass.approvedBy && (
                        <div className="pt-4 border-t border-border">
                          <p className="text-xs text-muted-foreground">Approved by Warden ID: {selectedOutpass.approvedBy}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="h-[600px] flex items-center justify-center border border-border rounded-sm bg-card/50">
                    <p className="text-muted-foreground">Select an outpass to view details</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </motion.div>
  );
}
