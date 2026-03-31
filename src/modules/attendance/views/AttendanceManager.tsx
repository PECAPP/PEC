'use client';

import { useState, useEffect, useTransition } from 'react';
import { 
  Upload, Save, Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useAction } from 'next-safe-action/hooks';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';
import PDFExportButton from '@/components/common/PDFExportButton';
import BulkUpload from '@/components/BulkUpload';
import { markBulkAttendanceAction } from '../actions';
import { motion, AnimatePresence } from 'framer-motion';

export default function AttendanceManager({ userId, userRole, initialData }: any) {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>(initialData?.courses || []);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const isAdmin = ['college_admin', 'super_admin'].includes(userRole);

  const { execute: executeBulk, isPending: isSaving } = useAction(markBulkAttendanceAction, {
    onSuccess: () => {
      toast.success('Professional session records saved.');
      fetchStudentAttendance();
    },
    onError: ({ error }) => toast.error(error.serverError || 'Failed to sync with API.'),
  });

  useEffect(() => {
    if (!initialData?.courses) fetchCourses();
  }, [userId, userRole]);

  useEffect(() => {
    if (selectedCourse && selectedDate) fetchStudentAttendance();
    else setStudents([]);
  }, [selectedCourse, selectedDate]);

  const fetchCourses = async () => {
    const response = await api.get<any>('/courses', { params: { limit: 200 } });
    let data = extractData<any[]>(response) || [];
    if (!isAdmin) {
      data = data.filter((c: any) => c.instructorId === userId || c.instructor === userId);
    }
    setCourses(data);
  };

  const fetchStudentAttendance = async () => {
    setLoading(true);
    try {
      const [enrollRes, usersRes, attRes] = await Promise.all([
        api.get<any>('/enrollments', { params: { courseId: selectedCourse, status: 'active', limit: 100 } }),
        api.get<any>('/users', { params: { role: 'student', limit: 1000 } }),
        api.get<any>('/attendance', { params: { subject: selectedCourse, date: selectedDate } })
      ]);

      const enrolled = extractData<any[]>(enrollRes) || [];
      const allUsers = extractData<any[]>(usersRes) || [];
      const records = extractData<any[]>(attRes) || [];
      
      const userMap = new Map(allUsers.map((u: any) => [u.id, u]));
      const recordMap = new Map(records.map((r: any) => [r.studentId, r]));

      setStudents(enrolled.map(en => {
        const u = userMap.get(en.studentId);
        const r = recordMap.get(en.studentId);
        return {
          id: en.studentId,
          name: u?.fullName || 'Unknown',
          email: u?.email || '',
          recordId: r?.id,
          status: r?.status || null
        };
      }));
    } catch (e) {
      toast.error('Identity handshake failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleMark = (id: string, status: any) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
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
    
    if (records.length === 0) return toast.info('No pending record updates detected.');
    executeBulk({ records });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black font-monument uppercase tracking-tight">Manager Nexus</h1>
           <p className="text-muted-foreground font-bold italic text-[11px] uppercase tracking-widest mt-1">Classroom Integrity Protocol</p>
        </div>
        <div className="flex gap-3">
          <PDFExportButton 
            onExport={async () => {
              if (!selectedCourse) {
                  toast.error('Select a course first.');
                  return;
              }
              const { exportAttendanceReport } = await import('@/lib/pdfExport');
              const course = courses.find(c => c.id === selectedCourse);
              exportAttendanceReport(course?.name || 'Report', students, { start: selectedDate, end: selectedDate });
            }} 
            label="Report Gen"
          />
          <Button variant="outline" onClick={() => setShowBulkUpload(true)} className="h-11 border-2 font-bold px-6 rounded-sm">
            <Upload className="w-4 h-4 mr-2" /> Injection
          </Button>
        </div>
      </div>

      <div className="card-elevated p-10 border-2 border-primary shadow-[10px_10px_0px_rgba(0,0,10,0.05)]">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="flex-1 space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Domain Selection</label>
             <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger className="h-14 border-2 rounded-sm font-black text-lg bg-background/50">
                   <SelectValue placeholder="Identify course cluster..." />
                </SelectTrigger>
                <SelectContent className="border-2 font-bold uppercase text-xs">
                   {courses.map(c => <SelectItem key={c.id} value={c.id}>{c.code} :: {c.name}</SelectItem>)}
                </SelectContent>
             </Select>
          </div>
          <div className="w-full md:w-64 space-y-2">
             <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Timestamp</label>
             <Input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="h-14 border-2 rounded-sm font-bold font-mono text-center" />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {selectedCourse ? (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="pt-10 border-t-2 border-border/50 mt-10">
              {loading ? <LoadingGrid count={4} /> : (
                <div className="space-y-8">
                  <div className="overflow-x-auto border-2 rounded-sm overflow-hidden">
                    <table className="w-full">
                       <thead className="bg-muted text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground">
                         <tr><th className="p-5 text-left">Identity Profile</th><th className="p-5 text-center">Status Assignment</th></tr>
                       </thead>
                       <tbody className="divide-y divide-border">
                         {students.map(s => (
                           <tr key={s.id} className="hover:bg-muted/30 transition-all">
                             <td className="p-5">
                               <p className="font-black text-base">{s.name}</p>
                               <p className="font-mono text-[9px] uppercase font-bold text-muted-foreground">{s.email}</p>
                             </td>
                             <td className="p-5">
                               <div className="flex justify-center gap-2">
                                 {['present', 'absent', 'late'].map((st: any) => (
                                   <Button
                                      key={st} size="sm" 
                                      variant={s.status === st ? 'default' : 'outline'}
                                      onClick={() => handleMark(s.id, st)}
                                      className={`h-10 px-6 font-black uppercase text-[10px] tracking-widest rounded-sm border-2 ${s.status === st ? 'bg-primary text-white' : 'hover:border-primary/50'}`}
                                   >
                                     {st[0]}
                                   </Button>
                                 ))}
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                    </table>
                  </div>
                  <div className="flex justify-end pt-6">
                    <Button onClick={handleSave} disabled={isSaving} className="h-16 px-14 bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl active:scale-[0.98] transition-all">
                       {isSaving ? <Loader2 className="w-5 h-5 animate-spin mr-3" /> : <Save className="w-5 h-5 mr-3" />}
                       Commit Session State
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <div className="p-20 text-center text-muted-foreground font-bold italic text-sm">Select a course cluster to initiate manager protocol.</div>
          )}
        </AnimatePresence>
      </div>

      <Dialog open={showBulkUpload} onOpenChange={setShowBulkUpload}>
        <DialogContent className="max-w-4xl border-2 border-primary rounded-sm overflow-hidden p-0">
           <DialogHeader className="bg-primary text-white p-10"><DialogTitle className="text-3xl font-black font-monument">MASS NODE INJECTION</DialogTitle></DialogHeader>
           <div className="p-10">
              <BulkUpload entityType="attendance" onImport={null as any} templateColumns={['studentEmail', 'courseCode', 'date', 'status']} sampleData={[{ studentEmail: 'identity@pec.edu', courseCode: 'CS101', date: '2024-03-31', status: 'present' }]} />
           </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
