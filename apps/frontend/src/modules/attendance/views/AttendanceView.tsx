'use client';

import { Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { AttendanceManagerSkeleton, StudentAttendanceSkeleton } from '@/components/common/ContentSkeletons';

// Lazy load the sub-views for performance
const AttendanceManager = dynamic<any>(() => import('./AttendanceManager'), {
    loading: () => <AttendanceManagerSkeleton />
});
const StudentAttendance = dynamic<any>(() => import('./StudentAttendance'), {
    loading: () => <StudentAttendanceSkeleton />
});


interface AttendanceViewProps {
  session: any;
  initialData?: any;
}

/**
 * Domain-Driven Attendance Logic Root
 * Professional Routing between Role-Specific Interfaces
 */
export default function AttendanceView({ session, initialData }: AttendanceViewProps) {
  const isAdmin = ['college_admin', 'super_admin'].includes(session.role);
  const isFaculty = session.role === 'faculty';

  return (
    <Suspense fallback={<AttendanceManagerSkeleton />}>
        { (isAdmin || isFaculty) ? (
            <AttendanceManager 
                userId={session.uid} 
                userRole={session.role} 
                initialData={initialData} 
            />
        ) : (
            <StudentAttendance 
                userId={session.uid} 
                initialData={initialData} 
            />
        )}
    </Suspense>
  );
}
