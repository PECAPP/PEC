'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  BookOpen, 
  UserCheck, 
  UserX, 
  TrendingUp, 
  Activity, 
  ShieldCheck, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import api from '@/lib/api';
import { extractData, cn } from '@/lib/utils';
import { LoadingGrid } from '@/components/common/AsyncState';
import { 
  RadialBarChart, 
  RadialBar, 
  ResponsiveContainer, 
  PolarAngleAxis 
} from 'recharts';

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

  const isEligible = overallPercentage >= 75;

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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-success/5 border border-success/10 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-success/70">Attended</p>
                  <p className="text-2xl font-bold font-display">{courseAttendance.reduce((s,c)=>s+c.present,0)}<span className="text-xs text-muted-foreground ml-1">Sessions</span></p>
                </div>
                <div className="p-4 rounded-2xl bg-destructive/5 border border-destructive/10 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-destructive/70">Missed</p>
                  <p className="text-2xl font-bold font-display">{courseAttendance.reduce((s,c)=>s+c.absent,0)}<span className="text-xs text-muted-foreground ml-1">Sessions</span></p>
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
            <button className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow hover:scale-[1.02] transition-all">
              Request Waiver <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

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
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{c.courseName}</span>
                      </div>
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
