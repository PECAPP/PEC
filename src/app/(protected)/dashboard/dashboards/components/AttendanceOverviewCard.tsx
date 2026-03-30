'use client';

import { ClipboardCheck } from 'lucide-react';

interface Props {
  attendancePercentage: number;
  onClick: () => void;
}

export function AttendanceOverviewCard({ attendancePercentage, onClick }: Props) {
  const strokeDasharray = 351.86;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * attendancePercentage) / 100;

  return (
    <div 
      className="card-elevated ui-card-pad cursor-pointer hover:bg-muted/50 transition-colors duration-150"
      onClick={onClick}
    >
      <h2 className="text-lg font-semibold text-foreground flex items-center gap-2 mb-6">
        <ClipboardCheck className="w-5 h-5 text-success" />
        Attendance Overview
      </h2>
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
            <span className="text-3xl font-bold">{attendancePercentage}%</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Present</span>
          </div>
        </div>
      </div>
    </div>
  );
}
