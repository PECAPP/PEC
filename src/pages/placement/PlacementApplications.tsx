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
  Mail,
  MessageSquare,
  Ban,
  ExternalLink,
  Sparkles,
  MessageCircle,
} from 'lucide-react';
import * as XLSX from 'xlsx';
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
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { usePermissions } from '@/hooks/usePermissions';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

interface Application {
  id: string;
  jobId: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  jobTitle: string;
  companyName: string;
  status: 'pending' | 'shortlisted' | 'hired' | 'rejected' | 'withdrawn';
  appliedAt: any;
  resumeUrl: string;
  feedback?: string;
  cgpa?: number;
  notes?: string;
  skills?: string[];
}

export default function PlacementApplications() {
  const { isRecruiter, isPlacementOfficer, isAdmin, user } = usePermissions();
  const navigate = useNavigate();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Note Dialog State
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false);
  const [currentAppForNote, setCurrentAppForNote] = useState<Application | null>(null);
  const [noteContent, setNoteContent] = useState('');

  useEffect(() => {
    if (!user) return;

    let q;
    if (isRecruiter) {
      q = query(collection(({} as any), 'applications'), where('recruiterId', '==', user.uid), orderBy('appliedAt', 'desc'));
    } else {
      q = query(collection(({} as any), 'applications'), orderBy('appliedAt', 'desc'));
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
      await updateDoc(doc(({} as any), 'applications', id), {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`Status updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleSaveNote = async () => {
    if (!currentAppForNote) return;
    
    try {
      await updateDoc(doc(({} as any), 'applications', currentAppForNote.id), {
        notes: noteContent,
        updatedAt: serverTimestamp(),
      });
      toast.success('Note saved successfully');
      setIsNoteDialogOpen(false);
      setNoteContent('');
      setCurrentAppForNote(null);
    } catch (error) {
      toast.error('Failed to save note');
    }
  };

  const openNoteDialog = (app: Application) => {
    setCurrentAppForNote(app);
    setNoteContent(app.notes || '');
    setIsNoteDialogOpen(true);
  };

  const handleViewResume = (url?: string) => {
    if (!url) {
      toast.error('No resume uploaded by this student');
      return;
    }
    window.open(url, '_blank');
  };

  const handleSendEmail = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  const exportApplications = () => {
    const data = filteredAndSortedApps.map(app => ({
      Student: app.studentName,
      Department: app.studentDepartment,
      CGPA: app.cgpa || 0,
      'Job Title': app.jobTitle,
      Company: app.companyName,
      Status: app.status,
      'Applied Date': app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : '',
      Score: app.aiScore
    }));
    
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Applications');
    XLSX.writeFile(workbook, `Placement_Applications_${new Date().toISOString().split('T')[0]}.xlsx`);
    toast.success('Applications exported successfully');
  };

  const handleStartChat = async (studentId: string, studentName: string) => {
    if (!user) return;
    
    try {
      // 1. Check if room exists
      const q = query(
        collection(({} as any), 'rooms'), 
        where('participants', 'array-contains', user.uid),
        orderBy('lastMessageAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const existingRoom = snapshot.docs.find(doc => {
        const data = doc.data();
        return data.type === 'dm' && data.participants.includes(studentId);
      });

      let roomId;

      if (existingRoom) {
        roomId = existingRoom.id;
      } else {
        // 2. Create new room
        const roomRef = await addDoc(collection(({} as any), 'rooms'), {
          type: 'dm',
          participants: [user.uid, studentId],
          participantNames: [user.fullName || 'Recruiter', studentName],
          title: studentName,
          lastMessage: 'Chat started',
          lastMessageAt: serverTimestamp(),
          createdAt: serverTimestamp(),
          createdBy: user.uid
        });
        roomId = roomRef.id;
      }

      // 3. Navigate to chat
      navigate(`/chat?room=${roomId}`);
    } catch (error) {
      console.error("Error starting chat:", error);
      toast.error('Failed to start chat');
    }
  };

  // Dynamic Profile Data Map
  const [studentProfiles, setStudentProfiles] = useState<Record<string, any>>({});

  // Filters & AI State
  const [minCgpa, setMinCgpa] = useState([0]);
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('date');

  // Fetch updated student data (CGPA, Skills, Resume) dynamically
  useEffect(() => {
    const fetchStudentProfiles = async () => {
      if (applications.length === 0) return;
      
      const studentIds = [...new Set(applications.map(app => app.studentId))];
      // Chunking to stay within backend filter limits
      const chunks = [];
      for(let i = 0; i < studentIds.length; i += 10) {
        chunks.push(studentIds.slice(i, i+10));
      }

      const newProfiles: Record<string, any> = {};

      for (const chunk of chunks) {
        try {
          const q = query(collection(({} as any), 'placementProfiles'), where('__name__', 'in', chunk));
          const snapshot = await getDocs(q);
          snapshot.docs.forEach(doc => {
            newProfiles[doc.id] = doc.data();
          });
        } catch (error) {
          console.error("Error fetching profiles:", error);
        }
      }
      
      setStudentProfiles(prev => ({...prev, ...newProfiles}));
    };

    fetchStudentProfiles();
  }, [applications.length]); // Re-run when list length changes

  // AI Scoring Logic (Updated to use dynamic data)
  const getAiScore = (app: Application) => {
    const profile = studentProfiles[app.studentId] || {};
    const effectiveCgpa = profile.cgpa || app.cgpa || 0;
    const hasResume = profile.resumeUrl || app.resumeUrl;

    let score = effectiveCgpa * 10; // Max 100
    
    // Resume bonus
    if (hasResume) score += 5;
    
    // Status bonus
    if (['shortlisted', 'hired'].includes(app.status)) score += 10;
    if (['rejected'].includes(app.status)) score -= 20;

    return Math.min(100, Math.max(0, Math.round(score)));
  };

  const filteredAndSortedApps = applications
    .map(app => {
      const profile = studentProfiles[app.studentId] || {};
      return {
        ...app,
        // Overlay dynamic data (check both cgpa and currentCgpa)
        cgpa: profile.cgpa ?? profile.currentCgpa ?? app.cgpa,
        skills: profile.skills ?? app.skills,
        resumeUrl: profile.resumeUrl || app.resumeUrl,
        aiScore: 0 // placeholder, calc below
      };
    })
    .map(app => ({...app, aiScore: getAiScore(app)})) // Recalculate score with overlaid data
    .filter(app => {
      const matchesSearch = app.studentName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.companyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           app.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      const matchesCgpa = (app.cgpa || 0) >= minCgpa[0];
      const matchesDept = departmentFilter === 'all' || app.studentDepartment === departmentFilter;
      
      return matchesSearch && matchesStatus && matchesCgpa && matchesDept;
    })
    .sort((a, b) => {
      if (sortBy === 'score') {
        return b.aiScore - a.aiScore;
      }
      return b.appliedAt?.toMillis() - a.appliedAt?.toMillis();
    });

  const departments = Array.from(
    new Set(
      filteredAndSortedApps
        .map((application) => application.studentDepartment)
        .filter(Boolean)
    )
  ).sort();

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
          <h1 className="text-3xl font-bold text-foreground">
            Applicant Tracking
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage candidates with AI-powered insights and advanced filtering
          </p>
        </div>
        <div className="flex gap-2">
           <Badge variant="outline" className="px-3 py-1 text-sm h-9 border-primary/20 bg-primary/5 text-primary">
            {filteredAndSortedApps.length} Candidates
          </Badge>
          <Button variant="outline" size="sm" onClick={exportApplications}>
            <Download className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Advanced Filters & AI Toolbar */}
      <div className="bg-card border border-border/50 shadow-sm p-5 rounded-xl space-y-4">
        {/* Main Search Row */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search by candidate, company, or role..." 
              className="pl-10 bg-background/50 border-border/50 focus:bg-background transition-colors"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full md:w-[180px] border-border/50">
              <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="shortlisted">Shortlisted</SelectItem>
              <SelectItem value="interviewed">Interviewed</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI & Metrics Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-border/50">
           {/* Sorting */}
           <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Sort By:</span>
            <div className="flex bg-muted/50 rounded-lg p-1">
               <button 
                 onClick={() => setSortBy('date')}
                 className={cn("px-3 py-1 text-xs rounded-md transition-all", sortBy === 'date' ? "bg-background shadow-sm text-foreground font-medium" : "text-muted-foreground hover:text-foreground")}
               >
                 Newest
               </button>
               <button 
                 onClick={() => setSortBy('score')}
                 className={cn("px-3 py-1 text-xs rounded-md transition-all flex items-center gap-1", sortBy === 'score' ? "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 font-medium shadow-sm" : "text-muted-foreground hover:text-purple-500")}
               >
                 <Sparkles className="w-3 h-3" /> AI Score
               </button>
            </div>
           </div>

           {/* CGPA Filter */}
           <div className="flex items-center gap-4 bg-muted/30 px-3 py-2 rounded-lg border border-border/50">
             <span className="text-xs font-medium text-muted-foreground min-w-[60px]">Min CGPA:</span>
             <input 
               type="range" 
               min="0" 
               max="10" 
               step="0.5" 
               value={minCgpa[0]} 
               onChange={(e) => setMinCgpa([parseFloat(e.target.value)])}
               className="w-full h-1.5 bg-muted-foreground/20 rounded-lg appearance-none cursor-pointer accent-primary"
             />
             <span className="text-xs font-bold w-8 text-right">{minCgpa[0]}</span>
           </div>

           {/* Branch Filter */}
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-full border-border/50 h-9 text-xs">
              <Building2 className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
              <SelectValue placeholder="Department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((department) => (
                <SelectItem key={department} value={department}>
                  {department}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedApps.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed border-muted-foreground/25"
            >
              <div className="bg-muted/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold">No applications found</h3>
              <p className="text-muted-foreground mt-1">Try adjusting your filters or search terms.</p>
            </motion.div>
          ) : (
            filteredAndSortedApps.map((app) => (
              <motion.div
                key={app.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="group bg-card hover:bg-card/80 border border-border/50 hover:border-primary/30 rounded-xl p-5 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Student Info */}
                  <div className="flex items-start gap-4 lg:w-1/3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary font-bold text-lg border border-primary/10 shadow-inner">
                      {app.studentName?.[0] || 'S'}
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors cursor-pointer" onClick={() => navigate(`/users/${app.studentId}`)}>
                        {app.studentName}
                      </h3>
                      <p className="text-sm text-muted-foreground">{app.studentDepartment}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Badge variant="secondary" className="text-[10px] h-5">
                          CGPA: {(app.cgpa !== undefined && app.cgpa !== null) ? Number(app.cgpa).toFixed(1) : 'N/A'}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] h-5 border-green-500/30 text-green-600 bg-green-500/5">
                          Verified
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Job/Company Info */}
                  <div className="flex-1 lg:border-l lg:border-r border-border/50 lg:px-6">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground">{app.jobTitle}</h4>
                      <ArrowUpRight className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-3">{app.companyName}</p>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" /> 
                        Applied {app.appliedAt?.toDate ? app.appliedAt.toDate().toLocaleDateString() : 'Recently'}
                      </span>
                      {app.notes && (
                        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                          <MessageSquare className="w-3.5 h-3.5" /> 
                          Has Notes
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex flex-col items-end gap-3 lg:w-1/4 min-w-[200px]">
                    <div className="flex items-center gap-2 w-full justify-end">
                      <StatusSelector 
                        currentStatus={app.status} 
                        onUpdate={(s) => handleUpdateStatus(app.id, s)}
                        disabled={!isRecruiter && !isPlacementOfficer && !isAdmin}
                      />
                    </div>

                    <div className="flex items-center justify-end gap-2 w-full pt-2">
                       <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewResume(app.resumeUrl)}
                        className="h-8 text-xs bg-background hover:bg-primary/5 hover:text-primary border-border/60"
                      >
                        <FileText className="w-3.5 h-3.5 mr-1.5" />
                        Resume
                      </Button>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => navigate(`/users/${app.studentId}`)}>
                            <User className="w-4 h-4 mr-2" /> View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendEmail(app.studentEmail)}>
                            <Mail className="w-4 h-4 mr-2" /> Send Email
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStartChat(app.studentId, app.studentName)}>
                            <MessageCircle className="w-4 h-4 mr-2" /> Chat with Candidate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openNoteDialog(app)}>
                            <MessageSquare className="w-4 h-4 mr-2" /> {app.notes ? 'Edit Note' : 'Add Note'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewResume(app.resumeUrl)}>
                             <ExternalLink className="w-4 h-4 mr-2" /> Open Resume
                          </DropdownMenuItem>
                          {(isPlacementOfficer || isAdmin) && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive focus:text-destructive text-red-600"
                                onClick={() => handleUpdateStatus(app.id, 'withdrawn')}
                              >
                                <Ban className="w-4 h-4 mr-2" /> Withdraw App
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Application Notes</DialogTitle>
            <DialogDescription>
              Add private notes for {currentAppForNote?.studentName}. These are only visible to admins and recruiters.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
             <Textarea 
               placeholder="e.g. Strong technical skills, interviewed well..." 
               value={noteContent}
               onChange={(e) => setNoteContent(e.target.value)}
               className="min-h-[100px]"
             />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveNote}>Save Note</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusSelector({ currentStatus, onUpdate, disabled }: { 
  currentStatus: Application['status'], 
  onUpdate: (s: Application['status']) => void,
  disabled: boolean 
}) {
  const styles: Record<string, string> = {
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20 hover:bg-yellow-500/20',
    shortlisted: 'bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20',
    interviewed: 'bg-purple-500/10 text-purple-600 border-purple-500/20 hover:bg-purple-500/20',
    hired: 'bg-green-500/10 text-green-600 border-green-500/20 hover:bg-green-500/20',
    rejected: 'bg-red-500/10 text-red-600 border-red-500/20 hover:bg-red-500/20',
    withdrawn: 'bg-gray-500/10 text-gray-600 border-gray-500/20 hover:bg-gray-500/20',
  };

  if (disabled) {
    return (
      <Badge variant="outline" className={cn("capitalize px-3 py-1 text-xs font-semibold border", styles[currentStatus] || styles.pending)}>
        {currentStatus?.replace('-', ' ')}
      </Badge>
    );
  }

  return (
    <Select value={currentStatus} onValueChange={(v: any) => onUpdate(v)}>
      <SelectTrigger className={cn("h-8 w-36 capitalize text-xs font-semibold border shadow-sm transition-all", styles[currentStatus] || styles.pending)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="pending">Pending</SelectItem>
        <SelectItem value="shortlisted">Shortlisted</SelectItem>
        <SelectItem value="interviewed">Interviewed</SelectItem>
        <SelectItem value="hired">Hired</SelectItem>
        <SelectItem value="rejected">Rejected</SelectItem>
        <SelectItem value="withdrawn">Withdrawn</SelectItem>
      </SelectContent>
    </Select>
  );
}
