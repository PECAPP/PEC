'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ErrorState, LoadingGrid } from '@/components/common/AsyncState';
import QRAttendanceScanner from '@/components/attendance/QRAttendanceScanner';
import { useStudentDashboard } from '@/hooks/useStudentDashboard';

// Components
import { StudentWelcomeHeader } from './components/StudentWelcomeHeader';
import { StudentStatsCards } from './components/StudentStatsCards';
import { EnrolledCoursesCard } from './components/EnrolledCoursesCard';
import { TodayScheduleCard } from './components/TodayScheduleCard';
import { AttendanceOverviewCard } from './components/AttendanceOverviewCard';
import { NoticeboardCard } from './components/NoticeboardCard';

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 }
};

interface StudentDashboardProps {
  initialData?: any;
  user?: any;
}

export function StudentDashboard({ initialData, user: initialUser }: StudentDashboardProps) {
  const enrolledCardRef = useRef<HTMLDivElement | null>(null);
  const [scheduleCardHeight, setScheduleCardHeight] = useState<number | null>(null);
  const {
    loading,
    firstName,
    profileData,
    showQRScanner,
    setShowQRScanner,
    stats,
    todayClasses,
    scheduleDay,
    enrolledCoursesList,
    noticeboardItems,
    requiredAttendancePercentage,
    loadError,
    setLoading,
    fetchStudentStats,
    handleQRSuccess,
    orgSlug,
  } = useStudentDashboard(initialData, initialUser);

  if (loading) {
    return (
       <div className="space-y-6 md:space-y-8">
          <div className="flex justify-between items-center">
             <div className="space-y-2">
                <div className="h-8 w-64 bg-muted animate-pulse rounded-md" />
                <div className="h-4 w-48 bg-muted animate-pulse rounded-md" />
             </div>
             <div className="h-10 w-32 bg-muted animate-pulse rounded-md" />
          </div>
          <LoadingGrid count={3} className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" itemClassName="h-24 rounded-md" />
          <div className="grid gap-5 md:gap-6 xl:grid-cols-3">
             <div className="lg:col-span-2 h-64 bg-muted animate-pulse rounded-xl" />
             <div className="h-64 bg-muted animate-pulse rounded-xl" />
          </div>
       </div>
    );
  }

  if (loadError) {
    return (
      <ErrorState
        title="Dashboard unavailable"
        description={loadError}
        actionLabel="Try again"
        onAction={() => {
          setLoading(true);
          void fetchStudentStats().finally(() => setLoading(false));
        }}
      />
    );
  }

  const getFullUrl = (path: string) => orgSlug ? `/${orgSlug}${path}` : path;

  useEffect(() => {
    const node = enrolledCardRef.current;
    if (!node) return;

    const updateHeight = () => {
      const nextHeight = node.offsetHeight;
      if (nextHeight > 0) setScheduleCardHeight(nextHeight);
    };

    updateHeight();

    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', updateHeight);
      return () => window.removeEventListener('resize', updateHeight);
    }

    const observer = new ResizeObserver(updateHeight);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="space-y-6 md:space-y-8">
      <StudentWelcomeHeader 
        firstName={firstName} 
        profileData={profileData} 
        onShowScanner={() => setShowQRScanner(true)} 
      />

      <StudentStatsCards 
        stats={stats} 
        onStatClick={(type) => {
          if (type === 'attendance') window.location.href = getFullUrl('/attendance');
          if (type === 'courses') window.location.href = getFullUrl('/courses');
          if (type === 'scores') window.location.href = getFullUrl('/score-sheet');
        }}
      />

      <div className="grid items-start gap-5 md:gap-6 xl:grid-cols-3">
        <EnrolledCoursesCard 
          containerRef={enrolledCardRef}
          className="self-start"
          enrolledCoursesList={enrolledCoursesList} 
          onViewAll={() => window.location.href = getFullUrl('/courses')}
          onCourseClick={(id) => window.location.href = getFullUrl(`/courses/${id}`)}
        />

        <TodayScheduleCard 
          scheduleDay={scheduleDay} 
          todayClasses={todayClasses} 
          onViewFull={() => window.location.href = getFullUrl('/timetable')}
          containerHeight={scheduleCardHeight}
        />
      </div>

      <motion.div 
        variants={item} 
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-3"
      >
        <AttendanceOverviewCard 
          className="lg:col-span-1"
          attendancePercentage={stats.attendancePercentage}
          onClick={() => window.location.href = getFullUrl('/attendance')}
          targetPercentage={requiredAttendancePercentage}
        />
        <NoticeboardCard
          className="lg:col-span-2"
          notices={noticeboardItems}
          onViewAll={() => window.location.href = getFullUrl('/noticeboard')}
        />
      </motion.div>

      <Dialog open={showQRScanner} onOpenChange={setShowQRScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Scan QR Code</DialogTitle>
          </DialogHeader>
          <QRAttendanceScanner
            onSuccess={handleQRSuccess}
            onClose={() => setShowQRScanner(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
