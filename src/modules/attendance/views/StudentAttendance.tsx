'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle, XCircle, Clock, BookOpen, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';

export default function StudentAttendance({ userId, initialData }: any) {
  const [loading, setLoading] = useState(!initialData?.summary);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(initialData?.records || []);
  const [courseAttendance, setCourseAttendance] = useState<any[]>(initialData?.summary?.courses || []);
  const [overallPercentage, setOverallPercentage] = useState(initialData?.summary?.totalSummary?.percentage || 0);

  useEffect(() => {
    if (!initialData?.summary) fetchData();
  }, [userId, initialData]);

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
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const statusMap = (p: number) => ({
    color: p >= 75 ? 'text-success' : p >= 65 ? 'text-warning' : 'text-destructive',
    bg: p >= 75 ? 'bg-success' : p >= 65 ? 'bg-warning' : 'bg-destructive'
  });

  if (loading) return <LoadingGrid count={4} className="grid md:grid-cols-2 gap-8" />;

  return (
    <div className="space-y-12">
      <div className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-black font-monument uppercase tracking-tight">Identity Status</h1>
           <p className="text-muted-foreground font-bold italic text-[11px] uppercase tracking-widest mt-1">Personal Integrity Metrics</p>
        </div>
        <div className="flex gap-4">
           <Badge variant="outline" className={`h-12 border-2 px-8 font-black uppercase tracking-widest text-[10px] rounded-sm ${overallPercentage >= 75 ? 'text-success border-success/30' : 'text-destructive border-destructive/30 animate-pulse'}`}>
             {overallPercentage >= 75 ? 'Protocol Eligible' : 'Status Alert'}
           </Badge>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="card-elevated p-12 border-2 border-primary relative overflow-hidden group shadow-[12px_12px_0px_rgba(255,0,0,0.05)]">
        <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity"><TrendingUp className="w-56 h-56" /></div>
        <div className="flex flex-col lg:flex-row items-center gap-16">
           <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90">
                <circle cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="none" className="text-muted/20" />
                <motion.circle 
                  cx="96" cy="96" r="88" stroke="currentColor" strokeWidth="16" fill="none" 
                  strokeDasharray={`${2 * Math.PI * 88}`} 
                  initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                  animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - overallPercentage / 100) }}
                  transition={{ duration: 1.5, ease: "circOut" }}
                  strokeLinecap="round" className={statusMap(overallPercentage).color}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`text-5xl font-black font-monument tracking-tighter ${statusMap(overallPercentage).color}`}>{Math.round(overallPercentage)}%</span>
                 <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mt-2">Aggregate</span>
              </div>
           </div>

           <div className="flex-1 grid grid-cols-2 gap-12 text-center lg:text-left">
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Authenticated Sessions</p>
                 <p className="text-5xl font-black font-monument text-success">{courseAttendance.reduce((s,c)=>s+c.present, 0)}</p>
              </div>
              <div className="space-y-2">
                 <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-70">Missed Syncs</p>
                 <p className="text-5xl font-black font-monument text-destructive">{courseAttendance.reduce((s,c)=>s+c.absent, 0)}</p>
              </div>
           </div>
        </div>
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
         {courseAttendance.map(c => (
           <motion.div key={c.courseId} whileHover={{ y: -6 }} className={`card-elevated p-8 border-2 rounded-sm relative overflow-hidden group shadow-[6px_6px_0px_rgba(0,0,0,0.03)] ${c.percentage < 75 ? 'border-destructive/40' : 'border-success/40'}`}>
              <div className="flex justify-between items-start mb-8">
                 <div className="space-y-2">
                    <Badge className="font-mono text-[10px] font-bold h-6 rounded-sm bg-muted text-muted-foreground border-border">{c.courseCode}</Badge>
                    <h3 className="font-black text-xl leading-tight uppercase font-monument tracking-tight">{c.courseName}</h3>
                 </div>
                 <div className={`text-3xl font-black font-monument ${statusMap(c.percentage).color}`}>{Math.round(c.percentage)}%</div>
              </div>
              <div className="space-y-6">
                 <div className="h-4 w-full bg-muted border border-border/50 rounded-sm overflow-hidden p-1">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${c.percentage}%` }} className={`h-full rounded-sm ${statusMap(c.percentage).bg}`} />
                 </div>
                 <div className="flex justify-between text-[10px] font-black uppercase tracking-widest px-1">
                    <span className="text-success">Vouched: {c.present}</span>
                    <span className="text-destructive">Ghosted: {c.absent}</span>
                 </div>
              </div>
           </motion.div>
         ))}
      </div>

      <div className="card-elevated border-2 rounded-sm overflow-hidden shadow-[15px_15px_0px_rgba(0,0,0,0.02)]">
         <div className="p-8 border-b-2 border-border bg-muted/40 flex items-center justify-between">
            <h2 className="font-black uppercase tracking-widest text-xs flex items-center gap-3"><Clock className="w-5 h-5 text-primary" /> Session Identity Log</h2>
         </div>
         <div className="divide-y-2 divide-border">
            {attendanceRecords.length === 0 ? <div className="p-20 text-center text-muted-foreground font-black uppercase tracking-widest text-[10px] italic">No identity logs detected.</div> : attendanceRecords.map(r => (
               <div key={r.id} className="p-6 flex items-center justify-between hover:bg-muted/30 transition-all border-l-8 border-transparent hover:border-primary">
                  <div className="flex items-center gap-8">
                     <div className={`w-14 h-14 border-2 rounded-sm flex items-center justify-center ${r.status === 'present' ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                        {r.status === 'present' ? <CheckCircle className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
                     </div>
                     <div>
                        <p className="font-black text-lg uppercase tracking-tight">{(courseAttendance || []).find(c => c.courseId === r.subject)?.courseCode || 'CORE_DOMAIN'}</p>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 opacity-70">{new Date(r.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                     </div>
                  </div>
                  <Badge className={`h-10 px-8 font-black uppercase tracking-widest text-[10px] rounded-sm ${r.status === 'present' ? 'bg-success text-white' : 'bg-destructive text-white'}`}>
                     {r.status}
                  </Badge>
               </div>
            ))}
         </div>
      </div>
    </div>
  );
}
