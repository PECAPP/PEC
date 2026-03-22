import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  Search, 
  Filter,
  Send,
  User,
  MapPin,
  RefreshCcw,
  ShieldCheck,
  Building2,
  Settings2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  updateDoc, 
  doc, 
  serverTimestamp,
  arrayUnion
} from '@/lib/dataClient';

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
  createdAt: any;
  updatedAt: any;
  responses?: { from: string; message: string; timestamp: any }[];
}

export default function HostelAdmin() {
  const [issues, setIssues] = useState<HostelIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState<HostelIssue | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Simplified query without orderBy to avoid composite index requirement
    const q = query(
      collection(null as any, 'hostelIssues'),
      where('status', '!=', 'archived')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const issuesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HostelIssue[];
      
      // Sort on client side
      const sortedIssues = issuesData.sort((a, b) => {
        const timeA = a.createdAt?.seconds || 0;
        const timeB = b.createdAt?.seconds || 0;
        return timeB - timeA;
      });

      setIssues(sortedIssues);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching hostel issues:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [selectedIssue?.id]);

  const updateStatus = async (issueId: string, newStatus: string) => {
    try {
      await updateDoc(doc(null as any, 'hostelIssues', issueId), {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      toast.success(`Issue marked as ${newStatus}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedIssue) return;

    try {
      await updateDoc(doc(null as any, 'hostelIssues', selectedIssue.id), {
        responses: arrayUnion({
          from: 'Maintenance Team',
          message: newMessage,
          timestamp: new Date()
        }),
        updatedAt: serverTimestamp()
      });
      setNewMessage('');
      toast.success('Reply sent');
    } catch (err) {
      toast.error('Failed to send reply');
    }
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

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.studentName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' || issue.status === activeTab;
    return matchesSearch && matchesTab;
  });

  const stats = {
    open: issues.filter(i => i.status === 'open').length,
    active: issues.filter(i => i.status === 'in_progress').length,
    resolved: issues.filter(i => i.status === 'resolved').length
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Hostel Maintenance Admin
          </h1>
          <p className="text-muted-foreground">Manage and resolve student hostel complaints efficiently.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-orange-500/10">
            <AlertCircle className="w-6 h-6 text-orange-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">New Requests</p>
            <p className="text-2xl font-bold">{stats.open}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10">
            <RefreshCcw className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">In Progress</p>
            <p className="text-2xl font-bold">{stats.active}</p>
          </div>
        </div>
        <div className="p-6 rounded-2xl border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-green-500/10">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Resolved Today</p>
            <p className="text-2xl font-bold">{stats.resolved}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by student or title..." 
              className="pl-10"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="card-elevated overflow-hidden bg-card border border-border rounded-2xl">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full rounded-none border-b bg-muted/50">
                <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                <TabsTrigger value="open" className="flex-1 text-orange-500">New</TabsTrigger>
                <TabsTrigger value="in_progress" className="flex-1 text-blue-500">Active</TabsTrigger>
                <TabsTrigger value="resolved" className="flex-1 text-green-500">Fixed</TabsTrigger>
              </TabsList>
              
              <div className="divide-y max-h-[600px] overflow-y-auto custom-scrollbar">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <div 
                      key={issue.id}
                      onClick={() => setSelectedIssue(issue)}
                      className={cn(
                        "p-4 cursor-pointer hover:bg-muted/30 transition-all",
                        selectedIssue?.id === issue.id && "bg-primary/5 border-l-4 border-primary"
                      )}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="secondary" className={getStatusConfig(issue.status).bg + " " + getStatusConfig(issue.status).color}>
                          {getStatusConfig(issue.status).label}
                        </Badge>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          {issue.createdAt?.toDate ? issue.createdAt.toDate().toLocaleDateString() : 'Just now'}
                        </span>
                      </div>
                      <h3 className="font-bold text-foreground line-clamp-1">{issue.title}</h3>
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <User className="w-3 h-3" /> {issue.studentName}
                        <MapPin className="w-3 h-3 ml-2" /> {issue.roomNumber}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-muted-foreground">
                    No issues matching your filters.
                  </div>
                )}
              </div>
            </Tabs>
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedIssue ? (
            <motion.div 
              layout
              className="card-elevated flex flex-col h-[750px] bg-card border border-border rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="p-6 border-b bg-muted/20">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold mb-1">{selectedIssue.title}</h2>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground italic">
                      <span>Reported by: <b className="text-primary">{selectedIssue.studentName}</b></span>
                      <span>Room: <b className="text-primary">{selectedIssue.roomNumber}</b></span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedIssue.status === 'open' && (
                      <Button size="sm" onClick={() => updateStatus(selectedIssue.id, 'in_progress')}>
                        Mark In Progress
                      </Button>
                    )}
                    {selectedIssue.status === 'in_progress' && (
                      <Button size="sm" variant="success" onClick={() => updateStatus(selectedIssue.id, 'resolved')}>
                        Mark Resolved
                      </Button>
                    )}
                  </div>
                </div>
                <div className="mt-4 p-4 rounded-xl bg-muted/30 text-sm leading-relaxed border border-border">
                  {selectedIssue.description}
                </div>
              </div>

              <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/5 custom-scrollbar">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
                  <MessageSquare className="w-4 h-4" /> Activity Logs
                </div>
                
                {selectedIssue.responses?.map((res, idx) => (
                  <div key={idx} className={cn(
                    "flex flex-col gap-1 max-w-[85%]",
                    res.from === 'Maintenance Team' ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "px-4 py-3 rounded-2xl text-sm shadow-sm",
                      res.from === 'Maintenance Team' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none"
                    )}>
                      {res.message}
                    </div>
                    <span className="text-[10px] text-muted-foreground px-1">
                      {res.from} • {res.timestamp?.toDate ? res.timestamp.toDate().toLocaleTimeString() : 'Just now'}
                    </span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t bg-card">
                <div className="flex gap-2">
                  <Input 
                    placeholder="Type a response to the student..." 
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button onClick={handleSendMessage} variant="gradient">
                    <Send className="w-4 h-4 mr-2" />
                    Reply
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="card-elevated h-full flex items-center justify-center bg-card border border-dashed border-border rounded-2xl">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-bold">Maintenance Console</h3>
                <p className="text-muted-foreground">Select an issue from the list to start resolving it.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
