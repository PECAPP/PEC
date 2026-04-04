'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight,
  Loader2,
  Paperclip,
  CheckCircle2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api, { isAuthError } from '@/lib/api';
import { extractData, cn } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';

type WaiverRequest = {
  id: string;
  courseId?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  fromDate: string;
  toDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  reviewerNote?: string | null;
  createdAt: string;
};

export default function StudentAttendance({ userId, initialData }: any) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const hasFetchedRef = useRef(false);
  const waiverFileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(!initialData?.summary);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(initialData?.records || []);
  const [courseAttendance, setCourseAttendance] = useState<any[]>(initialData?.summary?.courses || []);
  const [overallPercentage, setOverallPercentage] = useState(initialData?.summary?.totalSummary?.percentage || 0);
  const [isWaiverDialogOpen, setIsWaiverDialogOpen] = useState(false);
  const [isSubmittingWaiver, setIsSubmittingWaiver] = useState(false);
  const [isUploadingWaiverDoc, setIsUploadingWaiverDoc] = useState(false);
  const [uploadedWaiverFileName, setUploadedWaiverFileName] = useState('');
  const [waiverRequests, setWaiverRequests] = useState<WaiverRequest[]>([]);
  const [waiverForm, setWaiverForm] = useState({
    courseId: '',
    fromDate: '',
    toDate: '',
    reason: '',
    supportingDocUrl: '',
  });

  useEffect(() => {
    if (initialData?.summary) return;
    if (!userId) return;
    if (authLoading) return;
    if (!isAuthenticated) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void fetchData();
  }, [userId, initialData?.summary, authLoading, isAuthenticated]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [sumRes, recRes] = await Promise.all([
        api.get<any>('/attendance/summary'),
        api.get<any>('/attendance', { params: { studentId: userId, limit: 100 } })
      ]);
      const summary = extractData<any>(sumRes);
      if (summary) {
        setCourseAttendance(summary.courses || []);
        setOverallPercentage(summary.totalSummary?.percentage || 0);
      }
      setAttendanceRecords(extractData<any[]>(recRes) || []);
    } catch (e) {
      if (!isAuthError(e)) {
        console.error(e);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchWaiverRequests = async () => {
    try {
      const response = await api.get<any>('/attendance/waivers/my');
      const payload = extractData<any>(response);
      const list = extractData<WaiverRequest[]>(payload);
      setWaiverRequests(Array.isArray(list) ? list : []);
    } catch (error) {
      if (!isAuthError(error)) {
        toast.error('Unable to fetch waiver requests');
      }
    }
  };

  useEffect(() => {
    if (!isWaiverDialogOpen || authLoading || !isAuthenticated) return;
    void fetchWaiverRequests();
  }, [isWaiverDialogOpen, authLoading, isAuthenticated]);

  const handleWaiverSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmittingWaiver) return;

    if (!waiverForm.fromDate || !waiverForm.toDate || waiverForm.reason.trim().length < 10) {
      toast.error('Fill all required fields and provide a detailed reason (10+ chars).');
      return;
    }

    const selectedCourse = courseAttendance.find((course) => course.courseId === waiverForm.courseId);

    setIsSubmittingWaiver(true);
    try {
      await api.post('/attendance/waivers', {
        courseId: selectedCourse?.courseId || undefined,
        courseCode: selectedCourse?.courseCode || undefined,
        courseName: selectedCourse?.courseName || undefined,
        fromDate: waiverForm.fromDate,
        toDate: waiverForm.toDate,
        reason: waiverForm.reason.trim(),
        supportingDocUrl: waiverForm.supportingDocUrl.trim() || undefined,
      });

      toast.success('Waiver request submitted successfully.');
      setWaiverForm({
        courseId: waiverForm.courseId,
        fromDate: '',
        toDate: '',
        reason: '',
        supportingDocUrl: '',
      });
      await fetchWaiverRequests();
    } catch (error: any) {
      const message = String(error?.message || 'Failed to submit waiver request');
      toast.error(message);
    } finally {
      setIsSubmittingWaiver(false);
    }
  };

  const handleWaiverDocumentUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const maxBytes = 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error('File size should be 5 MB or less.');
      event.target.value = '';
      return;
    }

    const allowed = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(file.type)) {
      toast.error('Only PDF, JPG, PNG or WEBP files are allowed.');
      event.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploadingWaiverDoc(true);
    try {
      const response = await api.post<any>('/attendance/waivers/upload', formData);
      const uploaded = extractData<any>(response);
      const uploadedData = extractData<any>(uploaded);
      const docUrl = String(uploadedData?.url || '').trim();
      if (!docUrl) {
        throw new Error('Upload succeeded but no document URL was returned.');
      }

      setWaiverForm((prev) => ({ ...prev, supportingDocUrl: docUrl }));
      setUploadedWaiverFileName(String(uploadedData?.originalName || file.name));
      toast.success('Document attached successfully.');
    } catch (error: any) {
      toast.error(String(error?.message || 'Failed to upload document'));
    } finally {
      setIsUploadingWaiverDoc(false);
      event.target.value = '';
    }
  };

  const isEligible = overallPercentage >= 75;
  const totalPresent = courseAttendance.reduce((sum, course) => sum + (Number(course.present) || 0), 0);
  const totalAbsent = courseAttendance.reduce((sum, course) => sum + (Number(course.absent) || 0), 0);
  const totalSessions = totalPresent + totalAbsent;
  const leavesLeft =
    totalSessions > 0 ? Math.max(0, Math.floor(totalPresent / 0.75 - totalSessions)) : 0;
  const sessionsNeededForEligibility =
    totalSessions > 0 && !isEligible
      ? Math.max(0, Math.ceil((0.75 * totalSessions - totalPresent) / 0.25))
      : 0;

  const chartData = [
    {
      name: 'Attendance',
      value: overallPercentage,
      fill: 'url(#attendanceGradient)',
    },
  ];

  if (loading) return <LoadingGrid count={4} className="grid md:grid-cols-2 gap-8" />;

  return (
    <div className="space-y-10 pb-12 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-3">
            <Activity className="w-8 h-8 text-primary shadow-glow" />
            Attendance
          </h1>
          <p className="text-sm text-muted-foreground font-medium italic mt-1">View your attendance summary and eligibility status</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge 
            className={cn(
              "h-10 px-6 rounded-xl font-bold text-[10px] uppercase tracking-wider border-2",
              isEligible 
                ? "bg-success/10 text-success border-success/30" 
                : "bg-destructive/10 text-destructive border-destructive/30"
            )}
          >
            {isEligible ? (
              <span className="flex items-center gap-2"><ShieldCheck className="w-3.5 h-3.5" /> Eligible</span>
            ) : (
              <span className="flex items-center gap-2"><ShieldAlert className="w-3.5 h-3.5" /> At Risk</span>
            )}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Analytics Card */}
        <div className="lg:col-span-2 card-elevated p-8 bg-card/60 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp className="w-32 h-32 text-primary" />
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
            <div className="w-56 h-56 shrink-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="80%" 
                  outerRadius="100%" 
                  data={chartData} 
                  startAngle={90} 
                  endAngle={450}
                >
                  <defs>
                    <linearGradient id="attendanceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.6}/>
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis
                    type="number"
                    domain={[0, 100]}
                    angleAxisId={0}
                    tick={false}
                  />
                  <RadialBar
                    background
                    dataKey="value"
                    cornerRadius={15}
                    angleAxisId={0}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold font-display tracking-tight text-primary">
                  {Math.round(overallPercentage)}%
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground opacity-60">Cumulative</span>
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div>
                <h3 className="text-2xl font-bold tracking-tight mb-2">Overall Attendance</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Your cumulative presence is <span className="font-bold text-foreground">{Math.round(overallPercentage)}%</span>. 
                  Maintenance of a 75% threshold is mandatory for examination clearance.
                </p>
                <p className="text-xs font-semibold mt-3 text-primary/90">
                  {isEligible
                    ? `Leaves left (considering 75% attendance): ${leavesLeft} session${leavesLeft === 1 ? '' : 's'}.`
                    : `Leaves left (considering 75% attendance): 0. Attend ${sessionsNeededForEligibility} more session${sessionsNeededForEligibility === 1 ? '' : 's'} to recover eligibility.`}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-success/70">Attended</p>
                  <p className="text-2xl font-bold font-display">{totalPresent}<span className="text-xs text-muted-foreground ml-1">Sessions</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-destructive/70">Missed</p>
                  <p className="text-2xl font-bold font-display">{totalAbsent}<span className="text-xs text-muted-foreground ml-1">Sessions</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Info Card - Eligibility Protocol */}
        <div className="card-elevated p-8 bg-primary/5 border-primary/20 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] -z-10" />
          <div className="space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">Eligibility Guidelines</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Maintain academic compliance by tracking your course-wise attendance. Medical leave and waivers require official documentation.
            </p>
          </div>
          <div className="pt-6">
            <button
              onClick={() => setIsWaiverDialogOpen(true)}
              className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] transition-all"
            >
              Request Waiver <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <Dialog open={isWaiverDialogOpen} onOpenChange={setIsWaiverDialogOpen}>
        <DialogContent className="max-w-2xl border-border/60 bg-card/95 backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Request Attendance Waiver</DialogTitle>
            <DialogDescription>
              Submit your request with reason and date range. Faculty/admin will review it.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleWaiverSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Course (optional)</label>
                <select
                  value={waiverForm.courseId}
                  onChange={(e) => setWaiverForm((prev) => ({ ...prev, courseId: e.target.value }))}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">General Waiver (All Courses)</option>
                  {courseAttendance.map((course) => (
                    <option key={course.courseId} value={course.courseId}>
                      {course.courseCode} - {course.courseName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Supporting Document URL (optional)</label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="https://..."
                      value={waiverForm.supportingDocUrl}
                      onChange={(e) => {
                        setWaiverForm((prev) => ({ ...prev, supportingDocUrl: e.target.value }));
                        if (!e.target.value.trim()) {
                          setUploadedWaiverFileName('');
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => waiverFileInputRef.current?.click()}
                      disabled={isUploadingWaiverDoc}
                      className="shrink-0"
                    >
                      {isUploadingWaiverDoc ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Uploading
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <Paperclip className="w-4 h-4" /> Attach Document
                        </span>
                      )}
                    </Button>
                    <input
                      ref={waiverFileInputRef}
                      type="file"
                      accept=".pdf,image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={handleWaiverDocumentUpload}
                    />
                  </div>
                  {uploadedWaiverFileName ? (
                    <p className="text-xs text-success inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Attached: {uploadedWaiverFileName}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">From Date</label>
                <Input
                  type="date"
                  value={waiverForm.fromDate}
                  onChange={(e) => setWaiverForm((prev) => ({ ...prev, fromDate: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">To Date</label>
                <Input
                  type="date"
                  value={waiverForm.toDate}
                  onChange={(e) => setWaiverForm((prev) => ({ ...prev, toDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reason</label>
              <Textarea
                value={waiverForm.reason}
                onChange={(e) => setWaiverForm((prev) => ({ ...prev, reason: e.target.value }))}
                minLength={10}
                maxLength={1000}
                rows={4}
                placeholder="Explain your situation (medical, official duty, emergency, etc.)"
                required
              />
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmittingWaiver} className="min-w-40">
                {isSubmittingWaiver ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                  </span>
                ) : (
                  'Submit Waiver'
                )}
              </Button>
            </div>
          </form>

          <div className="mt-2 border-t border-border/50 pt-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Recent Requests</h4>
            <div className="max-h-56 overflow-auto rounded-xl border border-border/40 divide-y divide-border/30">
              {waiverRequests.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No waiver requests submitted yet.</div>
              ) : (
                waiverRequests.map((request) => (
                  <div key={request.id} className="p-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {request.courseCode ? `${request.courseCode} - ${request.courseName}` : 'General Waiver'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(request.fromDate).toLocaleDateString()} to {new Date(request.toDate).toLocaleDateString()}
                      </p>
                      {request.reviewerNote ? (
                        <p className="text-xs text-muted-foreground mt-1">Reviewer Note: {request.reviewerNote}</p>
                      ) : null}
                    </div>
                    <Badge
                      className={cn(
                        'uppercase text-[10px] font-bold tracking-wider',
                        request.status === 'approved'
                          ? 'bg-success/10 text-success border-success/30'
                          : request.status === 'rejected'
                            ? 'bg-destructive/10 text-destructive border-destructive/30'
                            : 'bg-primary/10 text-primary border-primary/30'
                      )}
                    >
                      {request.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-1">
          <div className="p-2 bg-primary/10 rounded-lg"><BookOpen className="w-4 h-4 text-primary" /></div>
          <h2 className="text-xl font-bold tracking-tight">Course Attendance</h2>
        </div>
        
        <div className="card-elevated overflow-hidden bg-card/60 backdrop-blur-sm shadow-xl">
           <table className="w-full border-collapse">
             <thead>
               <tr className="bg-muted/40 border-b border-border/40">
                 <th className="py-4 px-8 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Code</th>
                 <th className="py-4 px-8 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Course Name</th>
                 <th className="py-4 px-8 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Attended / Absent</th>
                 <th className="py-4 px-8 text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Percentage</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border/20">
               {Array.isArray(courseAttendance) && courseAttendance.map(c => (
                 <tr key={c.courseId} className="hover:bg-primary/[0.02] transition-colors group">
                   <td className="py-5 px-8 font-mono text-xs font-bold text-primary/80">{c.courseCode}</td>
                   <td className="py-5 px-8">
                      {(() => {
                        const present = Number(c.present) || 0;
                        const absent = Number(c.absent) || 0;
                        const total = present + absent;
                        const perCourseLeavesLeft =
                          total > 0 ? Math.max(0, Math.floor(present / 0.75 - total)) : 0;

                        return (
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.courseName}</span>
                        <span className="text-[11px] font-semibold text-muted-foreground mt-1">
                          Leaves left: {perCourseLeavesLeft}
                        </span>
                      </div>
                        );
                      })()}
                   </td>
                   <td className="py-5 px-8 text-center text-sm">
                      <div className="inline-flex items-center gap-3 bg-muted/30 px-4 py-1.5 rounded-full border border-border/40 font-bold">
                        <span className="text-success">{c.present}</span>
                        <span className="w-[1px] h-3 bg-border/60" />
                        <span className="text-destructive">{c.absent}</span>
                      </div>
                   </td>
                   <td className="py-5 px-8 text-right">
                     <div className="flex items-center justify-end gap-5">
                       <div className="w-32 h-2 bg-muted rounded-full overflow-hidden hidden sm:block border border-border/20">
                         <div 
                           className={cn(
                             "h-full transition-all duration-1000",
                             c.percentage >= 75 ? "bg-success shadow-[0_0_8px_rgba(var(--success-rgb,34,197,94),0.4)]" : "bg-destructive"
                           )} 
                           style={{ width: `${c.percentage}%` }} 
                         />
                       </div>
                       <span className={cn(
                         "text-lg font-display font-bold tracking-tight w-14",
                         c.percentage >= 75 ? "text-success" : "text-destructive"
                       )}>{Math.round(c.percentage)}%</span>
                     </div>
                   </td>
                 </tr>
               ))}
               {(!Array.isArray(courseAttendance) || courseAttendance.length === 0) && (
                 <tr>
                   <td colSpan={4} className="py-20 text-center text-muted-foreground italic text-sm">No attendance records found for this semester.</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <div className="space-y-6">
         <div className="flex items-center gap-3 px-1">
           <div className="p-2 bg-primary/10 rounded-lg"><Calendar className="w-4 h-4 text-primary" /></div>
           <h2 className="text-xl font-bold tracking-tight">Attendance History</h2>
         </div>
         
         <div className="card-elevated overflow-hidden bg-card/60 backdrop-blur-sm shadow-xl">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border/40">
                  <th className="py-4 px-8 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="py-4 px-8 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="py-4 px-8 text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/20">
                {(!Array.isArray(attendanceRecords) || attendanceRecords.length === 0) ? (
                  <tr>
                    <td colSpan={3} className="py-20 text-center text-muted-foreground italic text-sm">No historical data recorded.</td>
                  </tr>
                ) : (
                  attendanceRecords.map((r: any) => {
                    const courses = Array.isArray(courseAttendance) ? courseAttendance : [];
                    const course = courses.find((c: any) => c.courseId === r.subject);
                    const isPresent = r.status === 'present';
                    return (
                      <tr key={r.id} className="hover:bg-primary/[0.02] transition-colors">
                        <td className="py-5 px-8">
                          <span className="text-sm font-bold text-foreground/80">{new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </td>
                        <td className="py-5 px-8">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-muted rounded font-mono text-[10px] font-bold text-primary">{course?.courseCode || 'CORE'}</span>
                            <span className="text-sm font-bold text-foreground opacity-80">{course?.courseName || 'Academic Session'}</span>
                          </div>
                        </td>
                        <td className="py-5 px-8 text-right">
                          <Badge className={cn(
                            "px-4 py-1 rounded-full font-bold text-[9px] uppercase tracking-widest border-2",
                            isPresent ? "bg-success/10 text-success border-success/30" : "bg-destructive/10 text-destructive border-destructive/30"
                          )}>
                            {isPresent ? 'Present' : 'Absent'}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
         </div>
      </div>
    </div>
  );
}
