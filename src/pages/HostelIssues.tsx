import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Filter,
  Wrench,
  Zap,
  Droplets,
  Wifi,
  ThermometerSun,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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

interface HostelIssue {
  id: string;
  title: string;
  description: string;
  category: 'electrical' | 'plumbing' | 'internet' | 'maintenance' | 'hvac';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  roomNumber: string;
  createdAt: string;
  updatedAt: string;
  responses?: { from: string; message: string; time: string }[];
}

const mockIssues: HostelIssue[] = [
  {
    id: '1',
    title: 'AC not cooling properly',
    description: 'The air conditioner in my room is running but not cooling. The temperature stays the same even after hours of running.',
    category: 'hvac',
    priority: 'high',
    status: 'in_progress',
    roomNumber: 'A-204',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-21',
    responses: [
      { from: 'Maintenance Team', message: 'We have scheduled a technician visit for tomorrow between 10 AM - 12 PM.', time: '1 day ago' },
    ],
  },
  {
    id: '2',
    title: 'WiFi connectivity issues',
    description: 'WiFi signal is very weak in my room. Unable to attend online classes properly.',
    category: 'internet',
    priority: 'medium',
    status: 'open',
    roomNumber: 'A-204',
    createdAt: '2024-01-22',
    updatedAt: '2024-01-22',
  },
  {
    id: '3',
    title: 'Leaking tap in bathroom',
    description: 'The bathroom tap is leaking continuously, wasting water.',
    category: 'plumbing',
    priority: 'medium',
    status: 'resolved',
    roomNumber: 'A-204',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-17',
    responses: [
      { from: 'Maintenance Team', message: 'Issue has been fixed. Please confirm if the problem persists.', time: '5 days ago' },
      { from: 'You', message: 'Fixed. Thank you!', time: '5 days ago' },
    ],
  },
  {
    id: '4',
    title: 'Light fixture not working',
    description: 'The ceiling light in the study area is not working.',
    category: 'electrical',
    priority: 'low',
    status: 'closed',
    roomNumber: 'A-204',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-12',
  },
];

const categoryIcons = {
  electrical: Zap,
  plumbing: Droplets,
  internet: Wifi,
  maintenance: Wrench,
  hvac: ThermometerSun,
};

export default function HostelIssues() {
  const [issues, setIssues] = useState(mockIssues);
  const [activeTab, setActiveTab] = useState('all');
  const [newIssue, setNewIssue] = useState({ title: '', description: '', category: '', priority: 'medium' });
  const [selectedIssue, setSelectedIssue] = useState<HostelIssue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'all') return true;
    return issue.status === activeTab;
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'open': return { color: 'text-warning', bg: 'bg-warning/10', label: 'Open' };
      case 'in_progress': return { color: 'text-primary', bg: 'bg-primary/10', label: 'In Progress' };
      case 'resolved': return { color: 'text-success', bg: 'bg-success/10', label: 'Resolved' };
      case 'closed': return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Closed' };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: 'Unknown' };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'urgent': return { color: 'text-destructive', bg: 'bg-destructive/10' };
      case 'high': return { color: 'text-warning', bg: 'bg-warning/10' };
      case 'medium': return { color: 'text-primary', bg: 'bg-primary/10' };
      default: return { color: 'text-muted-foreground', bg: 'bg-muted' };
    }
  };

  const handleSubmitIssue = () => {
    if (!newIssue.title || !newIssue.description || !newIssue.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    const issue: HostelIssue = {
      id: Date.now().toString(),
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category as HostelIssue['category'],
      priority: newIssue.priority as HostelIssue['priority'],
      status: 'open',
      roomNumber: 'A-204',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setIssues(prev => [issue, ...prev]);
    setNewIssue({ title: '', description: '', category: '', priority: 'medium' });
    setDialogOpen(false);
    toast.success('Issue submitted successfully');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedIssue) return;

    const updatedIssues = issues.map(issue => {
      if (issue.id === selectedIssue.id) {
        return {
          ...issue,
          responses: [
            ...(issue.responses || []),
            { from: 'You', message: newMessage, time: 'Just now' },
          ],
        };
      }
      return issue;
    });

    setIssues(updatedIssues);
    setSelectedIssue(prev => prev ? {
      ...prev,
      responses: [...(prev.responses || []), { from: 'You', message: newMessage, time: 'Just now' }],
    } : null);
    setNewMessage('');
    toast.success('Message sent');
  };

  const stats = {
    total: issues.length,
    open: issues.filter(i => i.status === 'open').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved' || i.status === 'closed').length,
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hostel Issue Inbox</h1>
          <p className="text-muted-foreground">Report and track maintenance issues</p>
        </div>
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
              <DialogDescription>Describe the issue you're facing in your hostel room</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium text-foreground">Issue Title *</label>
                <Input
                  placeholder="Brief description of the issue"
                  value={newIssue.title}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, title: e.target.value }))}
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Category *</label>
                  <Select value={newIssue.category} onValueChange={(v) => setNewIssue(prev => ({ ...prev, category: v }))}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select category" />
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
                <div>
                  <label className="text-sm font-medium text-foreground">Priority</label>
                  <Select value={newIssue.priority} onValueChange={(v) => setNewIssue(prev => ({ ...prev, priority: v }))}>
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
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Description *</label>
                <Textarea
                  placeholder="Provide details about the issue..."
                  value={newIssue.description}
                  onChange={(e) => setNewIssue(prev => ({ ...prev, description: e.target.value }))}
                  className="mt-1"
                  rows={4}
                />
              </div>
              <Button className="w-full" onClick={handleSubmitIssue}>
                Submit Issue
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

      {/* Issues List */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <div className="card-elevated">
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
                {filteredIssues.length === 0 ? (
                  <div className="text-center py-12">
                    <Home className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">No issues found</p>
                  </div>
                ) : (
                  filteredIssues.map((issue) => {
                    const statusConfig = getStatusConfig(issue.status);
                    const priorityConfig = getPriorityConfig(issue.priority);
                    const CategoryIcon = categoryIcons[issue.category];
                    
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
                              <span className="text-xs text-muted-foreground">{issue.createdAt}</span>
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

        {/* Issue Detail */}
        <div className="lg:col-span-3">
          {selectedIssue ? (
            <div className="card-elevated h-full flex flex-col">
              <div className="p-6 border-b border-border">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-foreground">{selectedIssue.title}</h2>
                    <p className="text-sm text-muted-foreground mt-1">Room: {selectedIssue.roomNumber}</p>
                  </div>
                  <Badge className={cn(getStatusConfig(selectedIssue.status).bg, getStatusConfig(selectedIssue.status).color, 'border-0')}>
                    {getStatusConfig(selectedIssue.status).label}
                  </Badge>
                </div>
                <p className="mt-4 text-muted-foreground">{selectedIssue.description}</p>
                <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                  <span>Created: {selectedIssue.createdAt}</span>
                  <span>Updated: {selectedIssue.updatedAt}</span>
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
                          response.from === 'You' ? 'ml-auto bg-primary/10' : 'bg-muted'
                        )}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-foreground">{response.from}</span>
                          <span className="text-xs text-muted-foreground">{response.time}</span>
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
                <div className="p-4 border-t border-border">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a message..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
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
