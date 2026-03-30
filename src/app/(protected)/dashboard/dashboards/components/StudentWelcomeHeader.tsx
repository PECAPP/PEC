'use client';

import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  firstName: string;
  profileData: any;
  onShowScanner: () => void;
}

export function StudentWelcomeHeader({ firstName, profileData, onShowScanner }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-foreground">
          Welcome back, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          {profileData?.enrollmentNumber || 'Student'} • {profileData?.department || 'Department'} • Semester {profileData?.semester || '-'}
        </p>
      </div>
      <Button 
        onClick={onShowScanner}
        variant="gradient"
        className="w-full md:w-auto"
      >
        <Camera className="w-4 h-4 mr-2" />
        Mark Attendance
      </Button>
    </motion.div>
  );
}
