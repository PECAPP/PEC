'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface StudentProfileSummary {
  enrollmentNumber?: string | null;
  department?: string | null;
  semester?: number | string | null;
}

interface Props {
  firstName: string;
  profileData: StudentProfileSummary | null;
  onShowScanner: () => void;
}

export function StudentWelcomeHeader({ firstName, profileData, onShowScanner }: Props) {
  const getTimePeriod = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-primary/10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-sm"
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none translate-x-4 -translate-y-4">
        <Camera className="w-32 h-32 rotate-12" />
      </div>
      
      <div className="space-y-2 z-10">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider mb-1 animate-fade-in">
          Institutional Dashboard
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {getTimePeriod()}, {firstName}!
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">{profileData?.enrollmentNumber || 'Student'}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{profileData?.department || 'Department'}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Semester {profileData?.semester || '-'}</span>
        </div>
      </div>
      
      <div className="flex items-center gap-3 z-10 shrink-0">
        <Button 
          onClick={onShowScanner} 
          variant="gradient" 
          size="lg"
          className="w-full md:w-auto px-8 font-bold tracking-tight rounded-xl shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 transform hover:-translate-y-0.5"
        >
          <Camera className="mr-2 h-5 w-5" />
          Mark Attendance
        </Button>
      </div>
    </motion.div>
  );
}
