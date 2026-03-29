'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import type { 
  StudentProfile, 
  Course, 
  AttendanceRecord
} from '@/types';

interface StudentStats {
  attendancePercentage: number;
  enrolledCourses: number;
}

interface GradeRecord {
  id: string;
  studentId: string;
  courseId: string;
  total?: number;
  grade?: string;
  credits?: number;
}

const GRADES_ENDPOINT_DISABLED_KEY = 'api.examinations.grades.disabled';

const isGradesEndpointDisabled = () =>
  typeof window !== 'undefined' && sessionStorage.getItem(GRADES_ENDPOINT_DISABLED_KEY) === '1';

const disableGradesEndpoint = () => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(GRADES_ENDPOINT_DISABLED_KEY, '1');
  }
};

const isNotFoundError = (error: unknown) =>
  !!(error as any)?.response && (error as any).response.status === 404;

export function useStudentDashboard() {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: 0,
    enrolledCourses: 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  const fetchStudentStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const department = user.department;
      const semester = user.semester;
      const skipGrades = isGradesEndpointDisabled();
      const gradesPromise = Promise.resolve({ data: { success: true, data: [] as GradeRecord[] } });

      const [coursesResult, enrollmentsResult, attendanceResult, timetableResult] =
        await Promise.allSettled([
          api.get<ApiResponse<Course[]>>('/courses', {
            params: {
              limit: 200,
              offset: 0,
              ...(department ? { department } : {}),
              ...(semester ? { semester } : {}),
            },
          }),
          api.get<ApiResponse<any>>('/enrollments', {
            params: { limit: 200, offset: 0, status: 'active' },
          }),
          api.get<ApiResponse<AttendanceRecord[]>>('/attendance', {
            params: { limit: 200, offset: 0 },
          }),
          api.get<ApiResponse<any>>('/timetable', {
            params: {
              limit: 200,
              offset: 0,
              ...(department ? { department } : {}),
              ...(semester ? { semester } : {}),
            },
          }),
        ]);

      const allCourses =
        coursesResult.status === 'fulfilled' ? coursesResult.value.data.data || [] : [];
      const enrollments =
        enrollmentsResult.status === 'fulfilled'
          ? enrollmentsResult.value.data.data || []
          : [];
      const attendanceRecords =
        attendanceResult.status === 'fulfilled'
          ? attendanceResult.value.data.data || []
          : [];
      const timetableData =
        timetableResult.status === 'fulfilled'
          ? timetableResult.value.data.data || []
          : [];
      if (attendanceResult.status === 'rejected' && isNotFoundError(attendanceResult.reason)) {
        // Handle attendance error
      }

      const enrolledCourseIds = new Set(enrollments.map((e: any) => e.courseId));
      const enrolledCourses = allCourses.filter((c: any) => enrolledCourseIds.has(c.id));
      const enrolledCourseCodes = new Set(
        enrollments
          .map((enrollment: any) => enrollment.courseCode)
          .filter(Boolean),
      );

      setEnrolledCoursesList(enrolledCourses);

      // --- Process Attendance ---
      const present = attendanceRecords.filter((r: any) => r.status === 'present' || r.status === 'late').length;
      const attendancePercentage = attendanceRecords.length > 0 ? Math.round((present / attendanceRecords.length) * 100) : 0;

      // --- Process Timetable ---
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      let scheduleItems = (timetableData || [])
        .filter(
          (t: any) =>
            enrolledCourseIds.has(t.courseId) ||
            enrolledCourseCodes.has(t.courseCode),
        )
        .map((t: any) => ({
          ...t,
          day: t.day,
          courseName:
            allCourses.find((c: any) => c.code === t.courseCode)?.name ||
            t.courseName ||
            'Unknown',
          instructor:
            allCourses.find((c: any) => c.code === t.courseCode)?.instructor ||
            t.facultyName ||
            'TBA',
        }));

      const getScheduleForDay = (dayName: string) => {
        return scheduleItems
          .filter((item: any) => item.day === dayName)
          .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
      };

      let activeSchedule = getScheduleForDay(todayStr);
      let activeDay = todayStr;
      let displayLabel = 'Today';

      if (activeSchedule.length === 0) {
        const todayIndex = daysOfWeek.indexOf(todayStr);
        for (let i = 1; i < 7; i++) {
          const nextDayIndex = (todayIndex + i) % 7;
          const nextDay = daysOfWeek[nextDayIndex];
          const nextSchedule = getScheduleForDay(nextDay);
          
          if (nextSchedule.length > 0) {
            activeSchedule = nextSchedule;
            activeDay = nextDay;
            displayLabel = i === 1 ? 'Tomorrow' : nextDay;
            break;
          }
        }
      }

      setTodayClasses(activeSchedule);
      setScheduleDay(displayLabel);

      setStats({
        attendancePercentage,
        enrolledCourses: enrolledCourses.length,
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoadError('Unable to refresh dashboard data.');
      throw error;
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.replace('/auth');
      return;
    }

    if (user.role !== 'student') {
      router.replace('/dashboard');
      return;
    }

    void (async () => {
      try {
        setLoadError(null);
        setFirstName(user.fullName?.split(' ')[0] || 'Student');
        setProfileData({
          department: user.department,
          semester: user.semester,
          enrollmentNumber: user.enrollmentNumber,
        } as any);
        await fetchStudentStats();
      } catch (error) {
        setLoadError('Unable to load dashboard data.');
      } finally {
        setLoading(false);
      }
    })();
  }, [authLoading, user, router, fetchStudentStats]);

  const handleQRSuccess = () => {
    setStats((prev) => ({
      ...prev,
      attendancePercentage: Math.min(100, prev.attendancePercentage + 1),
    }));
    setShowQRScanner(false);
    void fetchStudentStats();
  };

  return {
    loading,
    firstName,
    profileData,
    showQRScanner,
    setShowQRScanner,
    stats,
    todayClasses,
    scheduleDay,
    enrolledCoursesList,
    loadError,
    setLoading,
    fetchStudentStats,
    handleQRSuccess,
    orgSlug,
  };
}
