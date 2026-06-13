'use client';

import { motion } from 'framer-motion';
import { Camera, FileText, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@pec/ui';
import api from '@pec/api';
import { toast } from 'sonner';

interface StudentProfileSummary {
  enrollmentNumber?: string | null;
  department?: string | null;
  semester?: number | string | null;
}

interface Props {
  firstName: string;
  profileData: StudentProfileSummary | null;
}

export function StudentWelcomeHeader({ firstName, profileData }: Props) {
  const [timePeriod, setTimePeriod] = useState<string>('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimePeriod('Good Morning');
    else if (hour < 17) setTimePeriod('Good Afternoon');
    else setTimePeriod('Good Evening');
  }, []);

  const handleDownloadTranscript = async () => {
    try {
      setDownloading(true);
      const res = await api.get('/pdf/transcript', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'transcript.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      toast.success('Transcript downloaded');
    } catch (error) {
      console.error('Failed to download transcript:', error);
      toast.error('Failed to download transcript');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden p-3 md:p-6 rounded-sm bg-gradient-to-br from-primary/5 via-transparent to-primary/5 border border-border/40 flex flex-col gap-6 md:flex-row md:items-center md:justify-between shadow-sm"
    >
      <div className="absolute top-0 right-0 p-4 opacity-[0.03] pointer-events-none translate-x-4 -translate-y-4">
        <Camera className="w-32 h-32 rotate-12" />
      </div>
      
      <div className="space-y-2 z-10">
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-sm font-medium tracking-wider mb-1 animate-fade-in">
          Institutional Dashboard
        </div>
        <h1 className="text-3xl font-bold text-foreground">
          {timePeriod ? `${timePeriod}, ${firstName}!` : `Welcome, ${firstName}!`}
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-foreground/80 font-medium">
          <span className="font-semibold text-primary">{profileData?.enrollmentNumber || 'Student'}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{profileData?.department || 'Department'}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Semester {profileData?.semester || '-'}</span>
        </div>
      </div>
      
      <div className="z-10 mt-4 md:mt-0">
        <Button 
          variant="default"
          onClick={handleDownloadTranscript}
          disabled={downloading}
          className="gap-2 bg-primary text-primary-foreground shadow-md hover:scale-[1.02] transition-all"
        >
          {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          Download Transcript
        </Button>
      </div>
      
    </motion.div>
  );
}
