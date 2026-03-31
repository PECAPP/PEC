'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import type { 
  StudentProfile, 
  Course, 
} from '@/types';
import { extractData } from '@/lib/utils';

interface StudentStats {
  attendancePercentage: number;
  enrolledCourses: number;
}

export function useStudentDashboard(initialData?: any, initialUser?: any) {
  const router = useRouter();
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { user, loading: authLoading } = useAuth();
  
  // Use SSR data if provided, otherwise show loading
  const [loading, setLoading] = useState(!initialData);
  const [firstName, setFirstName] = useState(initialUser?.fullName?.split(' ')[0] || 'Student');
  const [profileData, setProfileData] = useState<StudentProfile | null>(initialUser ? {
    department: initialUser.department,
    semester: initialUser.semester,
    enrollmentNumber: initialUser.enrollmentNumber,
  } as any : null);
  
  const [showQRScanner, setShowQRScanner] = useState(false);
  
  const [stats, setStats] = useState<StudentStats>({
    attendancePercentage: initialData?.summary?.totalSummary?.percentage || 0,
    enrolledCourses: initialData?.summary?.courses?.length || 0,
  });
  
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [scheduleDay, setScheduleDay] = useState<string>('Today');
  const [enrolledCoursesList, setEnrolledCoursesList] = useState<Course[]>(initialData?.summary?.courses || []);
  const [loadError, setLoadError] = useState<string | null>(null);

  const processDashboardData = useCallback((summary: any, allCourses: Course[], timetableData: any[]) => {
    if (summary && typeof summary === 'object') {
      const statsObj = summary.totalSummary || {};
      const rawCourses = Array.isArray(summary.courses) ? summary.courses : [];
      
      // Enrich enrolled courses with full details from allCourses
      const enrichedCourses = rawCourses.map((c: any) => {
        const idToMatch = String(c.id || c.courseId || '');
        const fullCourse = allCourses.find(ac => String(ac.id) === idToMatch);
        return { 
          ...fullCourse, 
          ...c, 
          id: idToMatch || c.id || c.courseId 
        };
      });

      setEnrolledCoursesList(enrichedCourses);
      setStats({
        attendancePercentage: typeof statsObj.percentage === 'number' ? statsObj.percentage : 0,
        enrolledCourses: enrichedCourses.length,
      });
      
      const enrolledCourseIds = new Set(enrichedCourses.map((c: any) => String(c.id)).filter(id => id && id !== 'undefined'));
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const safeTimetable = Array.isArray(timetableData) ? timetableData : [];
      
      let scheduleItems = safeTimetable
        .filter((t: any) => enrolledCourseIds.has(String(t.courseId)))
        .map((t: any) => {
          const course = allCourses.find((c: any) => String(c.id) === String(t.courseId));
          return {
            ...t,
            id: t.id || `schedule-${t.courseId}-${t.day}-${t.startTime}`,
            courseCode: course?.code || t.courseCode || 'CLS',
            courseName: course?.name || t.courseName || 'Class',
            instructor: course?.instructor || t.facultyName || t.instructor || 'Faculty',
            room: t.room || t.location || 'TBA'
          };
        });

      const getScheduleForDay = (dayName: string) => {
        return scheduleItems
          .filter((item: any) => String(item.day).toLowerCase() === dayName.toLowerCase())
          .sort((a: any, b: any) => (a.startTime || '').localeCompare(b.startTime || ''));
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
    }
  }, []);

  const fetchStudentStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      
      // Helper to handle both {data: {data: T}} and {data: T}
      const getData = (res: any) => {
        if (res?.data?.success && res.data.data) return res.data.data;
        if (res?.data) return res.data;
        return res;
      };

      const [summaryRes, coursesRes, timetableRes] = await Promise.all([
        api.get('/attendance/summary'),
        api.get('/courses'),
        api.get('/timetable'),
      ]);

      processDashboardData(
        getData(summaryRes),
        getData(coursesRes) || [],
        getData(timetableRes) || []
      );

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoadError('Unable to refresh dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user, processDashboardData]);

  // Handle hydration or manual refresh
  useEffect(() => {
    if (initialData) {
      processDashboardData(
        initialData.summary,
        initialData.courses || [],
        initialData.timetable || []
      );
      setLoading(false);
    }
  }, [initialData, processDashboardData]);

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

    if (!initialData) {
      void fetchStudentStats();
    }
  }, [authLoading, user, router, fetchStudentStats, initialData]);

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
