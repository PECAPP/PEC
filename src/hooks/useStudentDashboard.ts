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

interface EnrollmentRecord {
  id: string;
  courseId?: string | null;
  courseCode?: string | null;
}

interface TimetableRecord {
  id: string;
  day?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  courseId?: string | null;
  courseCode?: string | null;
  courseName?: string | null;
  facultyName?: string | null;
  instructor?: string | null;
  room?: string | null;
}

interface ScheduleItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  room: string;
}

const isNotFoundError = (error: unknown) =>
  !!(error as any)?.response && (error as any).response.status === 404;

const normalizeDay = (value: string | null | undefined): string => {
  if (!value) return '';
  const trimmed = value.trim().toLowerCase();
  if (!trimmed) return '';
  return `${trimmed[0].toUpperCase()}${trimmed.slice(1)}`;
};

export function useStudentDashboard() {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug?: string }>();
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState('Student');
  const [profileData, setProfileData] = useState<Partial<StudentProfile> | null>(null);
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: 0,
    enrolledCourses: 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<ScheduleItem[]>([]);
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
          api.get<ApiResponse<EnrollmentRecord[]>>('/enrollments', {
            params: { limit: 200, offset: 0, status: 'active' },
          }),
          api.get<ApiResponse<AttendanceRecord[]>>('/attendance', {
            params: { limit: 200, offset: 0 },
          }),
          api.get<ApiResponse<TimetableRecord[]>>('/timetable', {
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

      const enrolledCourseIds = new Set(
        enrollments
          .map((enrollment) => enrollment.courseId)
          .filter((courseId): courseId is string => typeof courseId === 'string' && courseId.length > 0),
      );
      const enrolledCourses = allCourses.filter((course) => enrolledCourseIds.has(course.id));
      const enrolledCourseCodes = new Set(
        enrollments
          .map((enrollment) => enrollment.courseCode)
          .filter((code): code is string => typeof code === 'string' && code.length > 0),
      );
      const courseById = new Map(allCourses.map((course) => [course.id, course] as const));
      const courseByCode = new Map(allCourses.map((course) => [course.code, course] as const));

      setEnrolledCoursesList(enrolledCourses);

      // --- Process Attendance ---
      const present = attendanceRecords.filter((record) => record.status === 'present' || record.status === 'late').length;
      const attendancePercentage = attendanceRecords.length > 0 ? Math.round((present / attendanceRecords.length) * 100) : 0;

      // --- Process Timetable ---
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      let scheduleItems: ScheduleItem[] = (timetableData || [])
        .filter(
          (timetableItem) =>
            (timetableItem.courseId ? enrolledCourseIds.has(timetableItem.courseId) : false) ||
            (timetableItem.courseCode ? enrolledCourseCodes.has(timetableItem.courseCode) : false),
        )
        .map((timetableItem) => {
          const matchedCourse =
            (timetableItem.courseId ? courseById.get(timetableItem.courseId) : undefined) ||
            (timetableItem.courseCode ? courseByCode.get(timetableItem.courseCode) : undefined);

          return {
            id: timetableItem.id,
            day: normalizeDay(timetableItem.day) || 'Unknown',
            startTime: timetableItem.startTime || '--:--',
            endTime: timetableItem.endTime || '--:--',
            courseCode: matchedCourse?.code || timetableItem.courseCode || 'N/A',
            courseName: matchedCourse?.name || timetableItem.courseName || 'Unknown',
            instructor: matchedCourse?.instructor || timetableItem.facultyName || timetableItem.instructor || 'TBA',
            room: timetableItem.room || 'Room TBA',
          };
        });

      const getScheduleForDay = (dayName: string) => {
        return scheduleItems
          .filter((item) => item.day === dayName)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
      };

      let activeSchedule = getScheduleForDay(todayStr);
      let displayLabel = 'Today';

      if (activeSchedule.length === 0) {
        const todayIndex = daysOfWeek.indexOf(todayStr);
        for (let i = 1; i < 7; i++) {
          const nextDayIndex = (todayIndex + i) % 7;
          const nextDay = daysOfWeek[nextDayIndex];
          const nextSchedule = getScheduleForDay(nextDay);
          
          if (nextSchedule.length > 0) {
            activeSchedule = nextSchedule;
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
          semester: user.semester != null ? String(user.semester) : undefined,
          enrollmentNumber: user.enrollmentNumber,
        });
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
