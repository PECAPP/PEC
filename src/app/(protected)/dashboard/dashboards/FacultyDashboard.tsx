'use client';

import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import QRAttendanceGenerator from '@/components/attendance/QRAttendanceGenerator';
import FacultyScheduleManager from '@/components/timetable/FacultyScheduleManager';
import { useFacultyDashboard } from '@/hooks/useFacultyDashboard';

// Components
import { FacultyHeader } from './components/FacultyHeader';
import { FacultyStatsGrid } from './components/FacultyStatsGrid';
import { FacultyTodaySchedule } from './components/FacultyTodaySchedule';
import { FacultyCoursesGrid } from './components/FacultyCoursesGrid';
import { LowAttendanceAlert } from './components/LowAttendanceAlert';
import { FacultyQuickActions } from './components/FacultyQuickActions';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export function FacultyDashboard() {
  const {
    loading,
    user,
    courses,
    stats,
    selectedCourse,
    setSelectedCourse,
    showQRModal,
    setShowQRModal,
    showScheduleManager,
    setShowScheduleManager,
    handleGenerateQR,
    router,
  } = useFacultyDashboard();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <FacultyHeader 
        courses={courses}
        selectedCourse={selectedCourse}
        onSelectCourse={setSelectedCourse}
        onShowScheduleManager={() => setShowScheduleManager(true)}
        onGenerateQR={handleGenerateQR}
      />

      <FacultyStatsGrid stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <FacultyTodaySchedule onViewFull={() => router.push('/timetable')} />
          <FacultyCoursesGrid onManage={() => router.push('/courses')} />
        </div>

        <div className="space-y-6">
          <LowAttendanceAlert />
          <FacultyQuickActions onAction={(path) => router.push(path)} />
        </div>
      </div>

      {/* QR Attendance Modal */}
      <Dialog open={showQRModal} onOpenChange={setShowQRModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>QR Attendance</DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <QRAttendanceGenerator
              courseId={selectedCourse.id}
              courseName={`${selectedCourse.code} - ${selectedCourse.name}`}
              onClose={() => setShowQRModal(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Schedule Manager Modal */}
      <Dialog open={showScheduleManager} onOpenChange={setShowScheduleManager}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Schedule</DialogTitle>
          </DialogHeader>
          <FacultyScheduleManager
            courses={courses}
            onScheduleAdded={() => setShowScheduleManager(false)}
          />
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

export default FacultyDashboard;
