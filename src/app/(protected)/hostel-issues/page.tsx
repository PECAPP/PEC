'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Wrench,
  Zap,
  Droplets,
  Wifi,
  ThermometerSun,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';
import { fetchAllPages } from '@/lib/fetchAllPages';

interface HostelIssue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  roomNumber: string;
  studentId: string;
  studentName: string;
  organizationId?: string;
  createdAt: string;
  updatedAt: string;
  responses?: { from: string; message: string; timestamp: string }[];
}

const categoryIcons: Record<string, any> = {
  electrical: Zap,
  plumbing: Droplets,
  internet: Wifi,
  maintenance: Wrench,
  hvac: ThermometerSun,
};

const getStatusConfig = (status: string) => {
  switch (status) {
    case 'open': return { color: 'text-orange-500', bg: 'bg-orange-500/10', label: 'Open' };
    case 'in_progress': return { color: 'text-blue-500', bg: 'bg-blue-500/10', label: 'In Progress' };
    case 'resolved': return { color: 'text-green-500', bg: 'bg-green-500/10', label: 'Resolved' };
    case 'closed': return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Closed' };
    default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
  }
};

const getPriorityConfig = (priority: string) => {
  switch (priority) {
    case 'urgent': return { color: 'text-red-500', bg: 'bg-red-500/10' };
    case 'high': return { color: 'text-orange-500', bg: 'bg-orange-500/10' };
    case 'medium': return { color: 'text-blue-500', bg: 'bg-blue-500/10' };
    default: return { color: 'text-green-500', bg: 'bg-green-500/10' };
  }
};

export default function HostelIssuesPage() {
  const { user } = usePermissions();

  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [authFailed, setAuthFailed] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<HostelIssue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'electrical',
    priority: 'medium',
    roomNumber: '',
  });

  const formatDate = (value: unknown) => {
    if (!value) return 'N/A';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString();
  };

  const formatTime = (value: unknown) => {
    if (!value) return 'N/A';
    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) return 'N/A';
    return date.toLocaleTimeString();
  };

  const fetchIssues = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const data = await fetchAllPages<HostelIssue>('/hostelIssues', {
        studentId: user.uid,
      });
      setIssues(Array.isArray(data) ? data : []);
      setAuthFailed(false);
    } catch (error: any) {
      if (error?.response?.status === 401) {
        setAuthFailed(true);
        return;
      }
      console.error('Error fetching issues:', error);
      toast.error('Failed to load issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.uid || authFailed) return;

    fetchIssues();
    const interval = setInterval(fetchIssues, 5000);
    return () => clearInterval(interval);
  }, [user?.uid, authFailed]);

  const handleSubmitIssue = async () => {
    if (!formData.title || !formData.description || !formData.category || !formData.roomNumber) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user?.uid) {
      toast.error('User information not available');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        roomNumber: formData.roomNumber,
        studentId: user.uid,
        studentName: user.fullName || user.name || user.email?.split('@')[0] || 'Student',
        status: 'open',
      };

      const response = await api.post('/hostelIssues', payload);

      if (response.data?.data?.id) {
        setFormData({
          title: '',
          description: '',
          category: 'electrical',
          priority: 'medium',
          roomNumber: '',
        });
        setDialogOpen(false);
        toast.success('Issue reported successfully!');
        await fetchIssues();
      }
    } catch (error: any) {
      console.error('Error submitting issue:', error);
      toast.error(error.response?.data?.message || 'Failed to submit issue');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddResponse = async () => {
    if (!newMessage.trim() || !selectedIssue) return;

    setSendingMessage(true);
    try {
      const response = await api.patch(
        `/hostelIssues/${selectedIssue.id}`,
        {
          responses: {
            _op: 'arrayUnion',
            val: {
              from: 'Student',
              message: newMessage,
              timestamp: new Date().toISOString(),
            },
          },
        }
      );

      if (response.data?.data) {
        setSelectedIssue(response.data.data);
        setNewMessage('');
        toast.success('Message sent!');
        await fetchIssues();
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return true;
    return issue.status === activeTab;
  });

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hostel Issues</h1>
          <p className="text-muted-foreground">Report and track maintenance issues</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchIssues}
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Report Issue
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Report New Issue</DialogTitle>
                <DialogDescription>Describe the issue you&apos;re facing in your hostel room</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Title *</label>
                  <Input
                    placeholder="e.g., Light bulb not working"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="mt-1"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Room Number *</label>
                    <Input
                      placeholder="e.g., A-204"
                      value={formData.roomNumber}
                      onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground">Category *</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
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
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground">Description *</label>
                  <Textarea
                    placeholder="Provide details about the issue..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <Button className="w-full" onClick={handleSubmitIssue} disabled={submitting}>
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Issue'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Home className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Issues</p>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <AlertCircle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-foreground">{stats.open}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-foreground">{stats.inProgress}</p>
            </div>
          </div>
        </div>
        <div className="card-elevated p-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-success/10">
              <CheckCircle2 className="w-5 h-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-foreground">{stats.resolved}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Issues List */}
        <div className="lg:col-span-2">
          <div className="card-elevated overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <div className="p-4 border-b border-border">
                <TabsList className="w-full">
                  <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                  <TabsTrigger value="open" className="flex-1">Open</TabsTrigger>
                  <TabsTrigger value="in_progress" className="flex-1">In Progress</TabsTrigger>
                  <TabsTrigger value="resolved" className="flex-1">Resolved</TabsTrigger>
                </TabsList>
              </div>

              <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-muted-foreground" />
                  </div>
                ) : filteredIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No issues found</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const statusConfig = getStatusConfig(issue.status);
                    const priorityConfig = getPriorityConfig(issue.priority);
                    const CategoryIcon = categoryIcons[issue.category] || Wrench;

                    return (
                      <div
                        key={issue.id}
                        className={cn(
                          'p-4 hover:bg-muted/30 transition-colors cursor-pointer',
                          selectedIssue?.id === issue.id && 'bg-muted/50'
                        )}
                        onClick={() => setSelectedIssue(issue)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', priorityConfig.bg)}>
                            <CategoryIcon className={cn('w-4 h-4', priorityConfig.color)} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-medium text-foreground truncate">{issue.title}</h3>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-1">{issue.description}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge className={cn(statusConfig.bg, statusConfig.color, 'border-0 text-xs')}>
                                {statusConfig.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatDate(issue.createdAt)}
                              </span>
                            </div>
                          </div>
                          {issue.responses && issue.responses.length > 0 && (
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MessageSquare className="w-4 h-4" />
                              <span className="text-xs">{issue.responses.length}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </Tabs>
          </div>
        </div>

        {/* Issue Details */}
        <div className="lg:col-span-3">
          {selectedIssue ? (
            <div className="card-elevated h-full flex flex-col">
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-foreground">{selectedIssue.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Room: {selectedIssue.roomNumber}</p>
                  </div>
                  <Badge className={cn(getStatusConfig(selectedIssue.status).bg, getStatusConfig(selectedIssue.status).color, 'border-0')}>
                    {getStatusConfig(selectedIssue.status).label}
                  </Badge>
                </div>
                <p className="mt-4 text-muted-foreground text-sm">{selectedIssue.description}</p>
                <div className="flex gap-4 mt-4 text-xs text-muted-foreground">
                  <span>Created: {formatDate(selectedIssue.createdAt)}</span>
                  <span>Category: {selectedIssue.category}</span>
                  <span>Priority: {selectedIssue.priority}</span>
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto">
                <h3 className="font-medium text-foreground mb-4">Messages</h3>
                {selectedIssue.responses && selectedIssue.responses.length > 0 ? (
                  <div className="space-y-4">
                    {selectedIssue.responses.map((response, i) => (
                      <div
                        key={i}
                        className={cn(
                          'p-4 rounded-lg max-w-[80%]',
                          response.from === 'Student' ? 'ml-auto bg-primary/10' : 'bg-muted'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{response.from}</span>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(response.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{response.message}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No messages yet</p>
                )}
              </div>

              {selectedIssue.status !== 'closed' && (
                <div className="border-t border-border space-y-4 p-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddResponse()}
                      disabled={sendingMessage}
                    />
                    <Button onClick={handleAddResponse} disabled={sendingMessage}>
                      {sendingMessage ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card-elevated h-full flex items-center justify-center">
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">Select an issue to view details</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
