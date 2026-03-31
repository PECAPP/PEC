'use client';

import { ClipboardCheck } from 'lucide-react';

interface Props {
  attendancePercentage: number;
  onClick: () => void;
}

export function AttendanceOverviewCard({ attendancePercentage, onClick }: Props) {
  const strokeDasharray = 351.86;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * attendancePercentage) / 100;
  const clampedPercentage = Math.max(0, Math.min(100, Math.round(attendancePercentage)));
  const targetPercentage = 75;
  const requiredToTarget = Math.max(0, targetPercentage - clampedPercentage);
  const statusLabel = clampedPercentage >= 75 ? 'On Track' : clampedPercentage >= 60 ? 'Borderline' : 'At Risk';
  const statusTone =
    clampedPercentage >= 75 ? 'text-success border-success/30 bg-success/10' :
    clampedPercentage >= 60 ? 'text-warning border-warning/30 bg-warning/10' :
    'text-destructive border-destructive/30 bg-destructive/10';

  return (
    <div 
      className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150 relative overflow-hidden"
      onClick={onClick}
    >
      <div className="absolute -top-12 -right-12 h-36 w-36 rounded-full bg-success/10 blur-2xl" />
      <div className="absolute -bottom-10 -left-10 h-28 w-28 rounded-full bg-primary/10 blur-2xl" />

      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
          <ClipboardCheck className="w-5 h-5 text-success" />
          Attendance Overview
        </h2>
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${statusTone}`}>
          {statusLabel}
        </span>
      </div>
      <div className="flex items-center justify-center h-48">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90">
            <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-muted/20" />
            <circle 
              cx="64" cy="64" r="56" 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="transparent" 
              strokeDasharray={strokeDasharray} 
              strokeDashoffset={strokeDashoffset}
              className={`transition-all duration-1000 ease-out ${attendancePercentage >= 75 ? 'text-success' : attendancePercentage >= 60 ? 'text-warning' : 'text-destructive'}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold">{clampedPercentage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Present</span>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-muted-foreground font-semibold mb-2">
          <span>Target {targetPercentage}%</span>
          <span>{requiredToTarget === 0 ? 'Goal Met' : `${requiredToTarget}% to go`}</span>
        </div>
        <div className="relative h-2 rounded-full bg-muted/60 overflow-hidden">
          <div 
            className={`h-full transition-all duration-700 ${clampedPercentage >= 75 ? 'bg-success' : clampedPercentage >= 60 ? 'bg-warning' : 'bg-destructive'}`}
            style={{ width: `${clampedPercentage}%` }}
          />
          <span className="absolute left-[60%] -top-3 h-3 w-[2px] bg-warning/80" />
          <span className="absolute left-[75%] -top-3 h-3 w-[2px] bg-success/80" />
          <span className="absolute left-[90%] -top-3 h-3 w-[2px] bg-success/40" />
        </div>
        <div className="flex items-center justify-between mt-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
          <span>60% Warning</span>
          <span>75% Safe</span>
          <span>90% Great</span>
        </div>
      </div>

      <div className="grid gap-3 mt-6 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Required</p>
          <p className="text-sm font-semibold">{requiredToTarget === 0 ? '0% needed' : `${requiredToTarget}% more`}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Status</p>
          <p className="text-sm font-semibold">{statusLabel}</p>
        </div>
        <div className="rounded-lg border border-border bg-background/60 p-3">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Next Milestone</p>
          <p className="text-sm font-semibold">{clampedPercentage >= 90 ? 'Maintain 90%+' : clampedPercentage >= 75 ? 'Reach 90%' : 'Reach 75%'}</p>
        </div>
      </div>
    </div>
  );
}
