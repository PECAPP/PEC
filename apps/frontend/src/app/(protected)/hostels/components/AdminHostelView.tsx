'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, AlertCircle, RefreshCcw, CheckCircle2, Search, MapPin, User,
  Send, ShieldCheck, Ticket, Calendar, QrCode, Clock
} from 'lucide-react';
import { toast } from 'sonner';

import { Button, Input, Badge, Tabs, TabsList, TabsTrigger, formatDate, PageBanner, StatCard, EmptyState, StatusBadge } from "@pec/ui";
import { cn, extractData } from '@/lib/utils';
import api from '@pec/api';
import { InteractiveFloorPlan } from './InteractiveFloorPlan';
import { usePermissions } from '@/hooks/usePermissions';

export default function AdminHostelView() {
  const { user } = usePermissions();
  const [issues, setIssues] = useState<any[]>([]);
  const [outpasses, setOutpasses] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
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
      const [issuesRes, outpassRes, roomsRes] = await Promise.all([
        api.get('/hostelIssues', { params: { limit: 2000 } }),
        api.get('/hostelOutpass', { params: { limit: 2000 } }),
        api.get('/rooms', { params: { limit: 1000 } })
      ]);
      const issueData: any[] = Array.isArray(extractData(issuesRes.data)) ? extractData(issuesRes.data) : [];
      const outpassData: any[] = Array.isArray(extractData(outpassRes.data)) ? extractData(outpassRes.data) : [];
      const roomsData: any[] = Array.isArray(extractData(roomsRes.data)) ? extractData(roomsRes.data) : [];
      
      setIssues(issueData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setOutpasses(outpassData.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
      setRooms(roomsData);
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

  const getStatusVariant = (status: string): "success" | "warning" | "danger" | "info" | "default" | "pending" => {
    switch (normalizeStatus(status)) {
      case 'pending': return 'warning';
      case 'assigned': return 'info';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'approved': return 'success';
      case 'rejected': return 'danger';
      default: return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (normalizeStatus(status)) {
      case 'pending': return 'Pending';
      case 'assigned': return 'Assigned';
      case 'resolved': return 'Resolved';
      case 'closed': return 'Closed';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status || 'Unknown';
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
    <div className="space-y-6">
      <PageBanner
        title="Hostel Warden Console"
        subtitle="SLA Tracking, Outpass Management & Floor Plans."
        icon={<Building2 className="w-7 h-7 text-primary" />}
        badgeText="Hostel Administration"
        actions={
          <Button variant="outline" onClick={fetchData} disabled={loading} className="glass-panel">
            <RefreshCcw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} /> Refresh
          </Button>
        }
      />

      {/* SLA Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <StatCard
          label="SLA Breached (Escalated)"
          value={stats.escalatedIssues}
          icon={<AlertCircle className="w-6 h-6" />}
          colorVariant="danger"
        />
        <StatCard
          label="Active Issues"
          value={stats.activeIssues}
          icon={<RefreshCcw className="w-6 h-6" />}
          colorVariant="warning"
        />
        <StatCard
          label="Pending Outpasses"
          value={stats.pendingOutpasses}
          icon={<Ticket className="w-6 h-6" />}
          colorVariant="info"
        />
      </div>

      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="issues" className="gap-1.5">
              <AlertCircle className="w-3.5 h-3.5" /> Issues & Floor Plan
            </TabsTrigger>
            <TabsTrigger value="outpasses" className="gap-1.5">
              <Ticket className="w-3.5 h-3.5" /> Digital Outpasses
            </TabsTrigger>
          </TabsList>

          {activeTab === 'issues' && (
            <div className="space-y-6">
              <InteractiveFloorPlan issues={issues} rooms={rooms} onRoomClick={(room) => setSearchTerm(room)} />
              
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-2 space-y-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search room or student..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <div className="bg-card border border-border/40 rounded-sm shadow-sm overflow-hidden">
                    <Tabs value={issuesFilter} onValueChange={setIssuesFilter}>
                      <TabsList className="mb-6">
                        <TabsTrigger value="all" className="flex-1 gap-1.5">
                          <Building2 className="w-3.5 h-3.5" /> All
                        </TabsTrigger>
                        <TabsTrigger value="pending" className="flex-1 gap-1.5">
                          <AlertCircle className="w-3.5 h-3.5" /> New
                        </TabsTrigger>
                        <TabsTrigger value="assigned" className="flex-1 gap-1.5">
                          <RefreshCcw className="w-3.5 h-3.5" /> Active
                        </TabsTrigger>
                      </TabsList>
                      <div className="divide-y max-h-[500px] overflow-y-auto custom-scrollbar">
                        {filteredIssues.map((issue) => (
                          <div key={issue.id} onClick={() => { setSelectedIssue(issue); setSelectedOutpass(null); }} className={cn("p-4 cursor-pointer hover:bg-muted/30 transition-all", selectedIssue?.id === issue.id && "bg-primary/5 border-l-4 border-border/40")}>
                            <div className="flex justify-between items-start mb-2">
                              <StatusBadge status={getStatusVariant(issue.status)}>{getStatusLabel(issue.status)}</StatusBadge>
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
                    <motion.div layout className="bg-card border border-border/40 rounded-sm shadow-sm flex flex-col h-[700px] overflow-hidden">
                      <div className="p-3 md:p-6 border-b bg-muted/20">
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
                          <div className="p-3 rounded-lg border border-red-500/20 flex items-center gap-2 mt-4 bg-red-500/10 text-red-500 text-sm">
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
                      <div className="flex-1 p-3 md:p-6 overflow-y-auto space-y-4 bg-muted/5 custom-scrollbar">
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
                    <div className="h-[700px] flex flex-col items-center justify-center bg-card border border-dashed rounded-sm border-white/5">
                      <EmptyState 
                        icon={<ShieldCheck className="w-10 h-10" />}
                        title="Select an issue"
                        description="Click on an issue from the list to review details"
                      />
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
                <div className="bg-card border border-border/40 rounded-sm shadow-sm overflow-hidden">
                  <Tabs value={outpassFilter} onValueChange={setOutpassFilter}>
                    <TabsList className="mb-6">
                      <TabsTrigger value="all" className="flex-1 gap-1.5">
                        <Ticket className="w-3.5 h-3.5" /> All
                      </TabsTrigger>
                      <TabsTrigger value="pending" className="flex-1 gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> Pending
                      </TabsTrigger>
                      <TabsTrigger value="approved" className="flex-1 gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </TabsTrigger>
                    </TabsList>
                    <div className="divide-y max-h-[600px] overflow-y-auto custom-scrollbar">
                      {filteredOutpasses.map((outpass) => (
                        <div key={outpass.id} onClick={() => { setSelectedOutpass(outpass); setSelectedIssue(null); }} className={cn("p-4 cursor-pointer hover:bg-muted/30 transition-all", selectedOutpass?.id === outpass.id && "bg-primary/5 border-l-4 border-border/40")}>
                          <div className="flex justify-between items-start mb-2">
                            <StatusBadge status={getStatusVariant(outpass.status)}>{getStatusLabel(outpass.status)}</StatusBadge>
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
                  <motion.div layout className="bg-card border border-border/40 rounded-sm shadow-sm flex flex-col h-[700px] overflow-hidden p-3 md:p-6">
                    <div className="flex justify-between items-start border-b border-border pb-6">
                      <div>
                        <h2 className="text-2xl font-bold">{selectedOutpass.destination}</h2>
                        <p className="text-sm text-muted-foreground mt-1">{selectedOutpass.studentName} • {selectedOutpass.hostelName} • {selectedOutpass.roomNumber}</p>
                        <StatusBadge className="mt-4" status={getStatusVariant(selectedOutpass.status)}>{getStatusLabel(selectedOutpass.status)}</StatusBadge>
                      </div>
                      {selectedOutpass.status === 'Approved' && selectedOutpass.qrCode && (
                        <div className="bg-white p-2 rounded-sm border border-border shadow-sm flex flex-col items-center">
                          <QrCode className="w-20 h-20 text-black" />
                          <span className="text-[10px]  text-muted-foreground font-bold mt-1">{selectedOutpass.qrCode.slice(0,8)}</span>
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
                  <div className="h-[700px] flex flex-col items-center justify-center bg-card border border-dashed rounded-sm border-white/5">
                    <EmptyState 
                      icon={<Ticket className="w-10 h-10" />}
                      title="Select an outpass"
                      description="Click on an outpass from the list to review details"
                    />
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
