'use client';

import { useState, useEffect } from 'react';
import { 
  Upload, 
  Database, 
  ShieldCheck, 
  Loader2, 
  Users, 
  Calendar as CalendarIcon,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Settings2,
  Filter,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useAction } from 'next-safe-action/hooks';
import api from '@/lib/api';
import { extractData, cn } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';
import PDFExportButton from '@/components/common/PDFExportButton';
import BulkUpload from '@/components/BulkUpload';
import { markBulkAttendanceAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchAllPages } from '@/lib/fetchAllPages';

export default function AttendanceManager({ userId, userRole, initialData }: any) {
  const [courses, setCourses] = useState<any[]>(initialData?.courses || []);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = ['college_admin', 'super_admin'].includes(userRole);

  const { execute: executeBulk, isPending: isSaving } = useAction(markBulkAttendanceAction, {
    onSuccess: () => {
      toast.success('Attendance records updated successfully.');
      fetchStudentAttendance();
    },
    onError: ({ error }) => toast.error(error.serverError || 'Failed to update records.'),
  });

  useEffect(() => {
    if (!initialData?.courses || initialData.courses.length === 0) fetchCourses();
  }, [userId, userRole]);

  useEffect(() => {
    if (selectedCourse && selectedDate) fetchStudentAttendance();
    else setStudents([]);
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    let data: any[] = [];
    if (isAdmin) {
      const response = await api.get<any>('/courses', { params: { limit: 200 } });
      data = extractData<any[]>(response) || [];
    } else {
      const response = await api.get<any>('/courses', { params: { facultyId: userId, limit: 200 } });
      data = extractData<any[]>(response) || [];
      if (!data.length) {
        let facultyName = '';
        try {
          const profileRes = await api.get<any>('/auth/profile');
          facultyName = profileRes?.data?.data?.fullName || profileRes?.data?.data?.name || profileRes?.data?.fullName || profileRes?.data?.name || '';
        } catch {
          facultyName = '';
        }
        const fallback = await api.get<any>('/courses', { params: { limit: 200 } });
        const allCourses = extractData<any[]>(fallback) || [];
        const name = facultyName.toLowerCase();
        data = allCourses.filter((c: any) => {
          if (c.facultyId === userId || c.instructorId === userId) return true;
          if (!name) return false;
          const instructor = String(c.instructor || c.facultyName || c.instructorName || '').toLowerCase();
          return instructor.includes(name);
        });
      }
    }
    setCourses(data);
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const course = courses.find((c) => c.id === selectedCourse);
      const subjectId = course?.id || selectedCourse;

      const [enrollRes, usersRes, attRes] = await Promise.all([
        api.get<any>('/enrollments', { params: { courseId: selectedCourse, status: 'active', limit: 200 } }),
        fetchAllPages<any>('/users', { role: 'student' }, 200),
        api.get<any>('/attendance', { params: { subject: subjectId, date: selectedDate } })
      ]);

      const enrolled = extractData<any[]>(enrollRes) || [];
      const allUsers = Array.isArray(usersRes) ? usersRes : [];
      const records = extractData<any[]>(attRes) || [];
      
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
      const recordMap = new Map(records.map((r: any) => [r.studentId, r]));

      setStudents(enrolled.map(en => {
        const u = userMap.get(en.studentId);
        const r = recordMap.get(en.studentId);
        return {
          id: en.studentId,
          name: u?.fullName || 'Unknown Student',
          email: u?.email || '',
          recordId: r?.id,
          status: r?.status || null
        };
      }));
    } catch (e) {
      toast.error('Failed to load student data.');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (id: string, status: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleBulkMark = (status: 'present' | 'absent') => {
    setStudents(prev => prev.map(s => ({ ...s, status })));
    toast.success(`Marked all students as ${status}`);
  };

  const handleSave = () => {
    const records = students
      .filter(s => s.status)
      .map(s => ({
        id: s.recordId,
        studentId: s.id,
        subject: selectedCourse,
        date: selectedDate,
        status: s.status as 'present' | 'absent' | 'late'
      }));
    
    if (records.length === 0) return toast.info('No changes to save.');
    executeBulk({ records });
  };

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    pending: students.filter(s => !s.status).length,
    participationRate: students.length > 0 ? (students.filter(s => s.status === 'present').length / students.length) * 100 : 0
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-500">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-border/40">
        <div className="flex items-center gap-5">
           <div className="p-3.5 bg-primary/10 rounded-2xl border border-primary/20 shadow-sm relative overflow-hidden group">
             <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
             <Settings2 className="w-8 h-8 text-primary shadow-glow relative z-10" />
           </div>
           <div>
             <h1 className="text-3xl font-bold tracking-tight text-foreground">Attendance Management</h1>
             <p className="text-sm text-muted-foreground font-medium italic mt-1 font-display">Mark and verify student attendance records</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
          <PDFExportButton 
            onExport={async () => {
              if (!selectedCourse) {
                toast.error('Select a course to export.');
                return;
              }
              const { exportAttendanceReport } = await import('@/lib/pdfExport');
              const course = courses.find(c => c.id === selectedCourse);
              exportAttendanceReport(course?.name || 'Attendance_Report', students, { start: selectedDate, end: selectedDate });
            }} 
            label="Export Report"
          />
          <Button 
            variant="outline" 
            onClick={() => setShowBulkUpload(true)} 
            className="h-11 rounded-xl px-5 border-border/60 font-bold text-[10px] uppercase tracking-widest gap-2 bg-background hover:bg-muted/40 transition-all border-2"
          >
            <FileSpreadsheet className="w-4 h-4" /> Bulk Upload
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {/* Selection Area */}
          <div className="card-elevated p-8 bg-card/60 backdrop-blur-sm border-primary/10 relative overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5">
               <Database className="w-24 h-24 text-primary" />
             </div>
             <div className="grid grid-cols-1 md:grid-cols-12 gap-8 relative z-10">
               <div className="md:col-span-8 space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                   <Filter className="w-3 h-3 text-primary" /> Course Selection
                 </label>
                 <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                   <SelectTrigger className="h-14 font-bold text-lg bg-background border-border/60 rounded-xl px-6 focus:ring-primary/20">
                     <SelectValue placeholder="Select course..." />
                   </SelectTrigger>
                   <SelectContent className="max-h-[400px]">
                     {courses.map(c => (
                       <SelectItem key={c.id} value={c.id} className="font-bold py-3 text-sm">
                         <span className="font-bold text-primary mr-3 opacity-60">[{c.code}]</span> {c.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
               </div>
               <div className="md:col-span-4 space-y-3">
                 <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                   <CalendarIcon className="w-3 h-3 text-primary" /> Session Date
                 </label>
                 <Input 
                   type="date" 
                   className="h-14 bg-background border-border/60 font-mono font-bold text-center text-lg rounded-xl focus:ring-primary/20"
                   value={selectedDate} 
                   onChange={(e) => setSelectedDate(e.target.value)} 
                 />
               </div>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {selectedCourse ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="space-y-6"
              >
                {/* Stats Bar */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                   {[
                     { label: 'Total Enrolled', value: stats.total, icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
                     { label: 'Present', value: stats.present, icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5' },
                     { label: 'Absent', value: stats.absent, icon: XCircle, color: 'text-destructive', bg: 'bg-destructive/5' },
                     { label: 'Participation', value: `${Math.round(stats.participationRate)}%`, icon: Activity, color: 'text-indigo-500', bg: 'bg-indigo-500/5' },
                   ].map((item, idx) => (
                     <div key={idx} className={cn(
                       "relative overflow-hidden p-5 rounded-2xl border border-border/40 bg-card/40 backdrop-blur-md flex flex-col gap-4 group transition-all duration-300 hover:border-primary/30 hover:translate-y-[-2px]",
                       item.bg
                     )}>
                        <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                          <item.icon className="w-16 h-16" />
                        </div>
                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center border border-border/40 bg-background", item.color)}>
                          <item.icon className="w-5 h-5 shadow-glow" />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground opacity-60 mb-1">{item.label}</p>
                          <p className="text-2xl font-bold font-display tracking-tight">
                            {item.value}
                          </p>
                        </div>
                     </div>
                   ))}
                </div>

                {/* List Container */}
                <div className="card-elevated overflow-hidden bg-card/60 backdrop-blur-sm shadow-2xl">
                  <div className="bg-muted/30 border-b border-border/40 px-8 py-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-primary rounded-full hidden sm:block" />
                      <span className="text-sm font-bold uppercase tracking-widest text-foreground/80">Student Enrollment List</span>
                    </div>
                    <div className="flex items-center gap-3">
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleBulkMark('present')}
                         className="h-9 px-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.1em] border-success/30 text-success hover:bg-success/10 transition-all"
                       >
                         Mark All Present
                       </Button>
                       <Button 
                         variant="outline" 
                         size="sm"
                         onClick={() => handleBulkMark('absent')}
                         className="h-9 px-5 rounded-xl font-bold text-[10px] uppercase tracking-[0.1em] border-destructive/30 text-destructive hover:bg-destructive/10 transition-all"
                       >
                         Mark All Absent
                       </Button>
                    </div>
                  </div>

                  {loading ? <div className="p-20"><LoadingGrid count={5} /></div> : (
                    <div className="divide-y divide-border/20">
                      {students.map(s => (
                        <div key={s.id} className="flex items-center justify-between py-6 px-8 hover:bg-primary/[0.02] transition-colors group">
                           <div className="flex items-center gap-6">
                              <div className="w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/20 font-bold text-primary text-xs shrink-0 group-hover:scale-110 transition-transform">
                                {s.name.substring(0, 2).toUpperCase()}
                              </div>
                              <div className="flex flex-col">
                                <span className="text-base font-bold text-foreground group-hover:text-primary transition-colors">{s.name}</span>
                                <span className="text-xs font-mono text-muted-foreground opacity-60">{s.email}</span>
                              </div>
                           </div>

                           <div className="flex items-center p-1 bg-muted/40 rounded-2xl border border-border/40 shadow-inner overflow-hidden">
                             {[
                               { id: 'present', label: 'Present', icon: CheckCircle2, activeClass: 'bg-success text-white shadow-xl shadow-success/30 border-success/50' },
                               { id: 'absent', label: 'Absent', icon: XCircle, activeClass: 'bg-destructive text-white shadow-xl shadow-destructive/30 border-destructive/50' }
                             ].map((status) => (
                               <button
                                 key={status.id}
                                 onClick={() => handleMark(s.id, status.id)}
                                 className={cn(
                                   "flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all duration-200 border-2 border-transparent",
                                   s.status === status.id 
                                     ? status.activeClass 
                                     : "text-muted-foreground font-medium grayscale hover:grayscale-0 hover:bg-background/80"
                                 )}
                               >
                                 <status.icon className={cn("w-4 h-4", s.status === status.id ? "animate-pulse" : "")} />
                                 {status.label}
                               </button>
                             ))}
                           </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-8 border-t border-border/40 bg-muted/10 flex justify-end">
                    <Button 
                      onClick={handleSave} 
                      disabled={isSaving || !selectedCourse}
                      className="bg-primary text-primary-foreground font-bold tracking-widest uppercase text-xs h-14 px-16 rounded-2xl shadow-glow hover:scale-[1.02] transition-all"
                    >
                       {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <CheckCircle2 className="w-5 h-5 mr-3 shadow-glow" />}
                       Update Attendance
                    </Button>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="py-32 text-center border-2 border-dashed border-primary/10 rounded-3xl bg-primary/[0.01] flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                  <Database className="w-8 h-8 text-primary/40" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold tracking-tight text-foreground/80">Select Parameters</h3>
                  <p className="text-sm text-center text-muted-foreground font-medium italic max-w-sm">Please select a course and date to begin marking attendance.</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
           <div className="card-elevated p-8 bg-primary/5 border-primary/20 space-y-6 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] -z-10" />
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20 shadow-sm transition-transform hover:rotate-12">
                <ShieldCheck className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold tracking-tight font-display">Instructions</h3>
                <p className="text-xs text-muted-foreground leading-relaxed font-bold opacity-80">
                  Ensure accurate verification of student presence. Attendance records are permanent academic logs.
                </p>
              </div>
              <ul className="space-y-3 pt-2">
                {[
                  'Verify student identity',
                  'Select correct date/course',
                  'Confirm and update records',
                ].map((rule, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-primary/70">
                    <div className="w-1 h-1 bg-primary rounded-full shrink-0" />
                    {rule}
                  </li>
                ))}
              </ul>
           </div>
        </div>
      </div>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl bg-card border-border/60 rounded-3xl p-0 overflow-hidden backdrop-blur-xl shadow-2xl">
           <DialogHeader className="bg-primary p-12 text-white">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <DialogTitle className="text-3xl font-black uppercase tracking-tight">Institutional Bulk Intake</DialogTitle>
                  <DialogDescription className="opacity-70 font-bold uppercase tracking-widest text-[11px] italic">Attendance Registry Parity System — CSV/Excel Protocol</DialogDescription>
                </div>
                <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                   <Upload className="w-8 h-8 text-white shadow-glow" />
                </div>
              </div>
           </DialogHeader>
           <div className="p-10">
             <BulkUpload 
               entityType="attendance" 
               onImport={null as any} 
               templateColumns={['studentEmail', 'courseCode', 'date', 'status']} 
               sampleData={[{ studentEmail: 'student@college.edu', courseCode: 'CS101', date: '2024-03-31', status: 'present' }]} 
             />
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
