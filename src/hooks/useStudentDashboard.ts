'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import type { 
  StudentProfile, 
  Course, 
} from '@/types';

type NoticeboardItem = {
  id: string;
  title: string;
  content: string;
  category: 'news' | 'update' | 'event' | 'alert' | string;
  important?: boolean;
  pinned?: boolean;
  authorName?: string;
  publishedAt?: string;
};

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
  const firstName = initialUser?.fullName?.split(' ')[0] || 'Student';
  const [profileData] = useState<StudentProfile | null>(initialUser ? {
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
  const [noticeboardItems, setNoticeboardItems] = useState<NoticeboardItem[]>(initialData?.noticeboard || initialData?.notices || []);
  const [requiredAttendancePercentage, setRequiredAttendancePercentage] = useState<number>(75);
  const [loadError, setLoadError] = useState<string | null>(null);

  const processDashboardData = useCallback((summary: any, allCourses: Course[], timetableData: any[], noticeboardData: any[] = []) => {
    setNoticeboardItems(Array.isArray(noticeboardData) ? noticeboardData : []);
    if (summary && typeof summary === 'object') {
      const statsObj = summary.totalSummary || {};
      const summaryCourses = Array.isArray(summary.courses) ? summary.courses : [];
      const fallbackCourses = Array.isArray(allCourses) ? allCourses : [];
      
      // Enrich enrolled courses with full details from allCourses
      const normalizedEnrolled: Course[] = summaryCourses.map((course: any, index: number) => {
        const idToMatch = String(course.courseId || course.id || '');
        const matchById = fallbackCourses.find((c) => String(c.id) === idToMatch);
        const matchByCode = fallbackCourses.find(
          (c) => c.code === course.courseCode || c.code === course.code
        );
        const matched = matchById ?? matchByCode;

        const resolvedId = idToMatch || matched?.id || `course-${index}`;

        return {
          id: resolvedId,
          code: course.code ?? course.courseCode ?? matched?.code ?? 'COURSE',
          name: course.name ?? course.courseName ?? matched?.name ?? 'Course',
          department: course.department ?? matched?.department ?? 'General',
          semester: course.semester ?? matched?.semester ?? 0,
          credits: course.credits ?? matched?.credits ?? 0,
          facultyName: course.facultyName ?? matched?.facultyName ?? '',
          maxStudents: course.maxStudents ?? matched?.maxStudents ?? 0,
          enrolledStudents: course.enrolledStudents ?? matched?.enrolledStudents ?? 0,
          description: course.description ?? matched?.description,
          type: course.type ?? matched?.type,
          instructor: (course.instructor ?? course.facultyName ?? matched?.instructor ?? matched?.facultyName) as string,
        };
      });

      setEnrolledCoursesList(normalizedEnrolled);
      setStats({
        attendancePercentage: typeof statsObj.percentage === 'number' ? statsObj.percentage : 0,
        enrolledCourses: normalizedEnrolled.length,
      });
      
      const enrolledCourseIds = new Set(normalizedEnrolled.map((c: any) => String(c.id)).filter(id => id && id !== 'undefined'));
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      
      const safeTimetable = Array.isArray(timetableData) ? timetableData : [];
      
      const scheduleItems = safeTimetable
        .filter((t: any) => enrolledCourseIds.has(String(t.courseId)))
        .map((t: any) => {
          const course = allCourses.find((c: any) => String(c.id) === String(t.courseId));
          return {
            ...t,
            id: t.id || `schedule-${t.courseId}-${t.day}-${t.startTime}`,
            courseCode: course?.code || t.courseCode || 'CLS',
            courseName: course?.name || t.courseName || 'Class',
            instructor: (course?.instructor || t.facultyName || t.instructor || 'Faculty') as string,
            room: (t.room || t.location || 'TBA') as string,
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

  const fetchCollegeSettings = useCallback(async () => {
    try {
      const response = await api.get('/college-settings');
      const data = response.data?.success ? response.data.data : response.data;
      if (data) {
        const value = Number(data?.attendanceRequiredPercentage);
        if (!Number.isNaN(value) && value > 0) {
          setRequiredAttendancePercentage(Math.max(0, Math.min(100, Math.round(value))));
        }
      }
    } catch {
      // Ignore settings errors and use default threshold
    }
  }, []);

  const fetchStudentStats = useCallback(async () => {
    if (!user) return;
    try {
      setLoadError(null);
      
      const getData = (res: any) => {
        if (res?.data?.success && res.data.data) return res.data.data;
        if (res?.data) return res.data;
        return res;
      };

      const [summaryRes, coursesRes, timetableRes, noticeboardRes] = await Promise.all([
        api.get('/attendance/summary'),
        api.get('/courses'),
        api.get('/timetable'),
        api.get('/noticeboard', { params: { limit: 4, offset: 0 } }),
      ]);

      processDashboardData(
        getData(summaryRes),
        getData(coursesRes) || [],
        getData(timetableRes) || [],
        getData(noticeboardRes) || []
      );

      const notices = getData(noticeboardRes);
      setNoticeboardItems(Array.isArray(notices?.data) ? notices.data : Array.isArray(notices) ? notices : []);
      void fetchCollegeSettings();

    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setLoadError('Unable to refresh dashboard data.');
    } finally {
      setLoading(false);
    }
  }, [user, processDashboardData, fetchCollegeSettings]);

  // Handle hydration or manual refresh
  useEffect(() => {
    if (initialData) {
      processDashboardData(
        initialData.summary,
        initialData.courses || [],
        initialData.timetable || [],
        initialData.noticeboard || initialData.notices || []
      );
      void fetchCollegeSettings();
      
      const dashboardNotices = initialData.noticeboard || initialData.notices;
      if (Array.isArray(dashboardNotices)) {
        setNoticeboardItems(dashboardNotices);
      } else {
        void (async () => {
          try {
            const res = await api.get('/noticeboard', { params: { limit: 4, offset: 0 } });
            const notices = res?.data?.success ? res.data.data : res?.data;
            if (Array.isArray(notices)) setNoticeboardItems(notices);
          } catch {
            // Ignore noticeboard errors for dashboard render
          }
        })();
      }
      setLoading(false);
    }
  }, [initialData, processDashboardData, fetchCollegeSettings]);

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
    } else {
      void fetchCollegeSettings();
    }
  }, [authLoading, user, router, fetchStudentStats, initialData, fetchCollegeSettings]);

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
    noticeboardItems,
    requiredAttendancePercentage,
    loadError,
    setLoading,
    fetchStudentStats,
    handleQRSuccess,
    orgSlug,
  };
}
