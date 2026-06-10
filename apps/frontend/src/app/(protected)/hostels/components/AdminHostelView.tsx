'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, AlertCircle, RefreshCcw, CheckCircle2, Search, MapPin, User,
  MessageSquare, Send, ShieldCheck, Ticket, Calendar, QrCode
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Badge, Tabs, TabsList, TabsTrigger, formatDate } from "@pec/ui";
import { cn, extractData } from '@/lib/utils';
import api from '@pec/api';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { usePermissions } from '@/hooks/usePermissions';

export default function AdminHostelView() {
  const { user } = usePermissions();
  const [issues, setIssues] = useState<any[]>([]);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('issues');
  const [issuesFilter, setIssuesFilter] = useState('all');
  const [outpassFilter, setOutpassFilter] = useState('all');
  
  const [selectedIssue, setSelectedIssue] = useState<any | null>(null);
  const [selectedOutpass, setSelectedOutpass] = useState<any | null>(null);
  
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [issuesRes, outpassRes] = await Promise.all([
        api.get('/hostelIssues', { params: { limit: 2000 } }),
        api.get('/hostelOutpass', { params: { limit: 2000 } })
      ]);
      const issueData: any[] = Array.isArray(extractData(issuesRes.data)) ? extractData(issuesRes.data) : [];
      const outpassData: any[] = Array.isArray(extractData(outpassRes.data)) ? extractData(outpassRes.data) : [];
      
      setIssues(issueData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setOutpasses(outpassData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (err) {
      console.error("Failed to fetch data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const updateIssueStatus = async (issueId: string, newStatus: string) => {
    try {
      await api.patch(`/hostelIssues/${issueId}`, { status: newStatus });
      toast.success(`Issue marked as ${newStatus}`);
      fetchData();
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue({ ...selectedIssue, status: newStatus });
      }
    } catch (_err) {
      toast.error('Failed to update status');
    }
  };

  const updateOutpassStatus = async (outpassId: string, newStatus: string) => {
    try {
      await api.patch(`/hostelOutpass/${outpassId}/status`, { status: newStatus });
      toast.success(`Outpass marked as ${newStatus}`);
      fetchData();
      if (selectedOutpass && selectedOutpass.id === outpassId) {
        setSelectedOutpass({ ...selectedOutpass, status: newStatus });
      }
    } catch (_err) {
      toast.error('Failed to update outpass status');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedIssue) return;
    try {
      await api.patch(`/hostelIssues/${selectedIssue.id}`, {
        responses: {
          _op: 'arrayUnion',
          val: { from: 'Maintenance Team', message: newMessage, timestamp: new Date().toISOString() },
        },
      });
      setNewMessage('');
      toast.success('Reply sent');
      fetchData();
    } catch (_err) {
      toast.error('Failed to send reply');
    }
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
      default: return { color: 'text-muted-foreground', bg: 'bg-muted', label: status || 'Unknown' };
    }
  };

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          issue.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = issuesFilter === 'all' || normalizeStatus(issue.status) === issuesFilter;
    return matchesSearch && matchesTab;
  });

  const filteredOutpasses = outpasses.filter(op => {
    const matchesSearch = op.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          op.destination?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = outpassFilter === 'all' || normalizeStatus(op.status) === outpassFilter;
    return matchesSearch && matchesTab;
  });

  const stats = {
    escalatedIssues: issues.filter(i => i.isEscalated && normalizeStatus(i.status) !== 'resolved').length,
    activeIssues: issues.filter(i => ['pending', 'assigned'].includes(normalizeStatus(i.status))).length,
    pendingOutpasses: outpasses.filter(o => normalizeStatus(o.status) === 'pending').length,
  };

  return (
    <div className="  px-4 py-8 ">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Building2 className="w-8 h-8 text-primary" />
            Hostel Warden Console
          </h1>
          <p className="text-muted-foreground">SLA Tracking, Outpass Management & Floor Plans.</p>
        </div>
        <Button variant="outline" onClick={fetchData} disabled={loading}>
          <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Refresh
        </Button>
      </div>

      {/* SLA Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4 border-l-4 border-l-red-500">
          <div className="p-3 rounded-sm bg-red-500/10"><AlertCircle className="w-6 h-6 text-red-500" /></div>
          <div><p className="text-sm text-muted-foreground">SLA Breached (Escalated)</p><p className="text-2xl font-bold text-red-500">{stats.escalatedIssues}</p></div>
        </div>
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4">
          <div className="p-3 rounded-sm bg-orange-500/10"><RefreshCcw className="w-6 h-6 text-orange-500" /></div>
          <div><p className="text-sm text-muted-foreground">Active Issues</p><p className="text-2xl font-bold">{stats.activeIssues}</p></div>
        </div>
        <div className="p-6 rounded-sm border bg-card/50 flex items-center gap-4 border-l-4 border-l-indigo-500">
          <div className="p-3 rounded-sm bg-indigo-500/10"><Ticket className="w-6 h-6 text-indigo-500" /></div>
          <div><p className="text-sm text-muted-foreground">Pending Outpasses</p><p className="text-2xl font-bold">{stats.pendingOutpasses}</p></div>
        </div>
      </div>

      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="issues">Issues & Floor Plan</TabsTrigger>
            <TabsTrigger value="outpasses">Digital Outpasses</TabsTrigger>
          </TabsList>

          {activeTab === 'issues' && (
            <div className="space-y-6">
              <InteractiveFloorPlan issues={issues} onRoomClick={(room) => setSearchTerm(room)} />
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search room or student..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="card-elevated overflow-hidden bg-card border border-border rounded-sm">
                    <Tabs value={issuesFilter} onValueChange={setIssuesFilter}>
                      <TabsList className="w-full rounded-none border-b bg-muted/50">
                        <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1">New</TabsTrigger>
                        <TabsTrigger value="assigned" className="flex-1">Active</TabsTrigger>
                      </TabsList>
                      <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredIssues.map((issue) => (
                          <div key={issue.id} onClick={() => { setSelectedIssue(issue); setSelectedOutpass(null); }} className={cn("p-4 cursor-pointer hover:bg-muted/30 transition-all", selectedIssue?.id === issue.id && "bg-primary/5 border-l-4 border-primary")}>
                            <div className="flex justify-between items-start mb-2">
                              <Badge variant="secondary" className={getStatusConfig(issue.status).bg + " " + getStatusConfig(issue.status).color}>{getStatusConfig(issue.status).label}</Badge>
                              {issue.isEscalated && normalizeStatus(issue.status) !== 'resolved' && (
                                <Badge variant="destructive" className="ml-2 text-[10px]">Escalated</Badge>
                              )}
                            </div>
                            <h3 className="font-bold text-foreground line-clamp-1">{issue.title}</h3>
                            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                              <User className="w-3 h-3" /> {issue.studentName} <MapPin className="w-3 h-3 ml-2" /> {issue.roomNumber}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Tabs>
                  </div>
                </div>

                <div className="lg:col-span-3">
                  {selectedIssue ? (
                    <motion.div layout className="card-elevated flex flex-col h-[700px] bg-card border border-border rounded-sm shadow-xl overflow-hidden">
                      <div className="p-6 border-b bg-muted/20">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-xl font-bold mb-1">{selectedIssue.title}</h2>
                            <p className="text-sm text-muted-foreground">Reported by: {selectedIssue.studentName} • Room: {selectedIssue.roomNumber}</p>
                          </div>
                          <div className="flex gap-2">
                            {normalizeStatus(selectedIssue.status) === 'pending' && <Button size="sm" onClick={() => updateIssueStatus(selectedIssue.id, 'assigned')}>Mark In Progress</Button>}
                            {normalizeStatus(selectedIssue.status) === 'assigned' && <Button size="sm" variant="success" onClick={() => updateIssueStatus(selectedIssue.id, 'resolved')}>Mark Resolved</Button>}
                          </div>
                        </div>
                        {selectedIssue.isEscalated && (
                          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-sm flex items-center gap-2 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" /> This issue breached SLA! Immediate action required.
                          </div>
                        )}
                        <p className="mt-4 text-sm text-foreground">{selectedIssue.description}</p>
                        {selectedIssue.images && selectedIssue.images.length > 0 && (
                          <div className="mt-4 flex gap-2 overflow-x-auto">
                            {selectedIssue.images.map((img: string, i: number) => (
                              <a href={img} target="_blank" rel="noreferrer" key={i}>
                                <img src={img} alt="evidence" className="h-24 w-24 object-cover rounded-sm border border-border hover:opacity-80 transition-opacity" />
                              </a>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-muted/5 custom-scrollbar">
                        {selectedIssue.responses?.map((res: any, idx: number) => (
                          <div key={idx} className={cn("flex flex-col gap-1 max-w-[85%]", res.from === 'Maintenance Team' ? "ml-auto items-end" : "items-start")}>
                            <div className={cn("px-4 py-3 rounded-sm text-sm shadow-sm", res.from === 'Maintenance Team' ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-card border border-border rounded-tl-none")}>{res.message}</div>
                            <span className="text-[10px] text-muted-foreground px-1">{res.from} • {res.timestamp ? new Date(res.timestamp).toLocaleTimeString() : 'Just now'}</span>
                          </div>
                        ))}
                      </div>
                      {selectedIssue.status !== 'closed' && (
                        <div className="p-4 border-t bg-card flex gap-2">
                          <Input placeholder="Type a response..." value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
                          <Button onClick={handleSendMessage} variant="gradient"><Send className="w-4 h-4" /></Button>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="h-[700px] flex flex-col items-center justify-center bg-card border border-dashed rounded-sm">
                      <ShieldCheck className="w-12 h-12 text-muted-foreground/50 mb-4" />
                      <p className="text-muted-foreground">Select an issue from the list</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'outpasses' && (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search outpass..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
                <div className="card-elevated overflow-hidden bg-card border border-border rounded-sm">
                  <Tabs value={outpassFilter} onValueChange={setOutpassFilter}>
                    <TabsList className="w-full rounded-none border-b bg-muted/50">
                      <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
                      <TabsTrigger value="pending" className="flex-1">Pending</TabsTrigger>
                      <TabsTrigger value="approved" className="flex-1">Approved</TabsTrigger>
                    </TabsList>
                    <div className="divide-y max-h-[600px] overflow-y-auto custom-scrollbar">
                      {filteredOutpasses.map((outpass) => (
                        <div key={outpass.id} onClick={() => { setSelectedOutpass(outpass); setSelectedIssue(null); }} className={cn("p-4 cursor-pointer hover:bg-muted/30 transition-all", selectedOutpass?.id === outpass.id && "bg-primary/5 border-l-4 border-primary")}>
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="secondary" className={getStatusConfig(outpass.status).bg + " " + getStatusConfig(outpass.status).color}>{getStatusConfig(outpass.status).label}</Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(outpass.departureDate)}</span>
                          </div>
                          <h3 className="font-bold text-foreground line-clamp-1">{outpass.destination}</h3>
                          <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                            <User className="w-3 h-3" /> {outpass.studentName} <MapPin className="w-3 h-3 ml-2" /> {outpass.roomNumber}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Tabs>
                </div>
              </div>

              <div className="lg:col-span-3">
                {selectedOutpass ? (
                  <motion.div layout className="card-elevated flex flex-col h-[700px] bg-card border border-border rounded-sm shadow-xl overflow-hidden p-6">
                    <div className="flex justify-between items-start border-b border-border pb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedOutpass.destination}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{selectedOutpass.studentName} • {selectedOutpass.hostelName} • {selectedOutpass.roomNumber}</p>
                        <Badge className={cn('mt-4 border-0', getStatusConfig(selectedOutpass.status).bg, getStatusConfig(selectedOutpass.status).color)}>{getStatusConfig(selectedOutpass.status).label}</Badge>
                      </div>
                      {selectedOutpass.status === 'Approved' && selectedOutpass.qrCode && (
                        <div className="bg-white p-2 rounded-sm border border-border shadow-sm flex flex-col items-center">
                          <QrCode className="w-20 h-20 text-black" />
                          <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mt-1">{selectedOutpass.qrCode.slice(0,8)}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-6 space-y-6">
                      <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-sm">
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> Departure</p>
                          <p className="font-medium mt-1">{new Date(selectedOutpass.departureDate).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground flex items-center gap-1"><Calendar className="w-4 h-4" /> Return</p>
                          <p className="font-medium mt-1">{new Date(selectedOutpass.returnDate).toLocaleString()}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">Reason</p>
                        <p className="bg-muted/10 p-4 rounded-sm border border-border text-sm">{selectedOutpass.reason}</p>
                      </div>
                    </div>

                    {normalizeStatus(selectedOutpass.status) === 'pending' && (
                      <div className="mt-auto pt-6 flex gap-4">
                        <Button className="flex-1" variant="success" onClick={() => updateOutpassStatus(selectedOutpass.id, 'Approved')}>Approve Outpass</Button>
                        <Button className="flex-1" variant="destructive" onClick={() => updateOutpassStatus(selectedOutpass.id, 'Rejected')}>Reject</Button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <div className="h-[700px] flex flex-col items-center justify-center bg-card border border-dashed rounded-sm">
                    <Ticket className="w-12 h-12 text-muted-foreground/50 mb-4" />
                    <p className="text-muted-foreground">Select an outpass request to review</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Tabs>
      </div>
    </div>
  );
}
