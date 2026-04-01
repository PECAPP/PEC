'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Calendar, BookOpen, UserCheck, UserX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { extractData } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';

export default function StudentAttendance({ userId, initialData }: any) {
  const hasFetchedRef = useRef(false);
  const [loading, setLoading] = useState(!initialData?.summary);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>(initialData?.records || []);
  const [courseAttendance, setCourseAttendance] = useState<any[]>(initialData?.summary?.courses || []);
  const [overallPercentage, setOverallPercentage] = useState(initialData?.summary?.totalSummary?.percentage || 0);

  useEffect(() => {
    if (initialData?.summary) return;
    if (!userId) return;
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    void fetchData();
  }, [userId, initialData?.summary]);

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

  const getStatusColor = (percentage: number) => {
    if (percentage >= 75) return 'text-success';
    if (percentage >= 65) return 'text-warning';
    return 'text-destructive';
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-success';
    if (percentage >= 65) return 'bg-warning';
    return 'bg-destructive';
  };

  if (loading) return <LoadingGrid count={4} className="grid md:grid-cols-2 gap-8" />;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Attendance Records</h1>
          <p className="text-sm text-muted-foreground font-medium italic">Official academic attendance summary for the current semester</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={overallPercentage >= 75 ? 'outline' : 'destructive'} className="h-8 px-4 font-bold border-border/60">
            {overallPercentage >= 75 ? 'STATUS: ELIGIBLE' : 'STATUS: BELOW TARGET'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card-elevated p-6 bg-card/50">
           <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Cumulative Attendance</p>
           <div className="flex items-baseline gap-2">
             <span className={`text-4xl font-bold tracking-tight ${getStatusColor(overallPercentage)}`}>{Math.round(overallPercentage)}%</span>
             <span className="text-xs font-medium text-muted-foreground">of total classes</span>
           </div>
           <div className="mt-4 h-1.5 w-full bg-muted rounded-full">
             <motion.div initial={{ width: 0 }} animate={{ width: `${overallPercentage}%` }} className={`h-full ${getProgressColor(overallPercentage)}`} />
           </div>
        </div>

        <div className="card-elevated p-6 bg-card/50 border-l-4 border-success">
           <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Classes Attended</p>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-success/10 rounded-lg"><UserCheck className="w-5 h-5 text-success" /></div>
             <span className="text-4xl font-bold text-foreground">{courseAttendance.reduce((s,c)=>s+c.present,0)}</span>
           </div>
        </div>

        <div className="card-elevated p-6 bg-card/50 border-l-4 border-destructive">
           <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-4">Classes Missed</p>
           <div className="flex items-center gap-3">
             <div className="p-2 bg-destructive/10 rounded-lg"><UserX className="w-5 h-5 text-destructive" /></div>
             <span className="text-4xl font-bold text-foreground">{courseAttendance.reduce((s,c)=>s+c.absent,0)}</span>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center gap-2 px-1">
           <BookOpen className="w-4 h-4 text-primary" />
           <h2 className="text-base font-bold tracking-tight text-foreground">Course Performance</h2>
        </div>
        
        <div className="border border-border/60 rounded-lg overflow-hidden bg-card/50 shadow-sm">
           <table className="w-full border-collapse">
             <thead>
               <tr className="bg-muted/40 border-b border-border/60">
                 <th className="py-3 px-6 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Course Code</th>
                 <th className="py-3 px-6 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Course Name</th>
                 <th className="py-3 px-6 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Attended</th>
                 <th className="py-3 px-6 text-center font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Missed</th>
                 <th className="py-3 px-6 text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Percentage</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-border/40">
               {courseAttendance.map(c => (
                 <tr key={c.courseId} className="hover:bg-muted/10 transition-colors">
                   <td className="py-4 px-6 font-mono text-xs font-bold text-primary">{c.courseCode}</td>
                   <td className="py-4 px-6 text-sm font-medium text-foreground">{c.courseName}</td>
                   <td className="py-4 px-6 text-center text-sm font-bold text-success">{c.present}</td>
                   <td className="py-4 px-6 text-center text-sm font-bold text-destructive">{c.absent}</td>
                   <td className="py-4 px-6 text-right">
                     <div className="flex items-center justify-end gap-3 font-bold">
                       <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden hidden sm:block">
                         <div className={`h-full ${getProgressColor(c.percentage)}`} style={{ width: `${c.percentage}%` }} />
                       </div>
                       <span className={getStatusColor(c.percentage)}>{Math.round(c.percentage)}%</span>
                     </div>
                   </td>
                 </tr>
               ))}
               {courseAttendance.length === 0 && (
                 <tr>
                   <td colSpan={5} className="py-12 text-center text-muted-foreground italic text-sm">No course enrollments found for current session.</td>
                 </tr>
               )}
             </tbody>
           </table>
        </div>
      </div>

      <div className="space-y-4 pt-6">
         <div className="flex items-center justify-between px-1">
           <div className="flex items-center gap-2">
             <Calendar className="w-4 h-4 text-primary" />
             <h2 className="text-base font-bold tracking-tight text-foreground">Recent Session History</h2>
           </div>
         </div>
         
         <div className="border border-border/60 rounded-lg overflow-hidden bg-card/50 shadow-sm">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/40 border-b border-border/60">
                  <th className="py-3 px-6 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Date</th>
                  <th className="py-3 px-6 text-left font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Course</th>
                  <th className="py-3 px-6 text-right font-bold text-[10px] uppercase tracking-wider text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {attendanceRecords.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-12 text-center text-muted-foreground italic text-sm">No historical attendance records found.</td>
                  </tr>
                ) : (
                  attendanceRecords.map((r) => {
                    const course = (courseAttendance || []).find(c => c.courseId === r.subject);
                    const isPresent = r.status === 'present';
                    return (
                      <tr key={r.id} className="hover:bg-muted/10 transition-colors">
                        <td className="py-4 px-6">
                          <span className="text-sm font-medium text-foreground">{new Date(r.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-bold text-foreground">{course?.courseCode || 'CORE'}</span>
                          <span className="text-xs text-muted-foreground ml-2 opacity-70">| {course?.courseName || 'Academic Session'}</span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <span className={`text-xs font-bold uppercase tracking-wider ${isPresent ? 'text-success' : 'text-destructive'}`}>
                            {isPresent ? 'Present' : 'Absent'}
                          </span>
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




