'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useFacultyDashboard(initialData?: any, serverUser?: any) {
  const router = useRouter();
  const { user: clientUser, loading: authLoading } = useAuth();
  
  // Use server user as fallback to prevent layout shift
  const user = clientUser || serverUser;

  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  
  const [courses, setCourses] = useState<any[]>(initialData?.courses || []);
  const [notices, setNotices] = useState<any[]>(initialData?.notices || []);
  const [courseCards, setCourseCards] = useState<any[]>(initialData?.courseCards || []);
  const [todaySchedule, setTodaySchedule] = useState<any[]>(initialData?.todaySchedule || []);
  const [loading, setLoading] = useState(!initialData || (initialData?.courses?.length === 0));
  const [stats, setStats] = useState(initialData?.stats || { activeCount: 0, studentCount: 0, lowAttendanceCount: 0 });

  const fetchFacultyData = useCallback(async () => {
    if (!user || user.role !== 'faculty') return;

    const hasPrecomputedCards = Array.isArray(initialData?.courseCards);
    const hasPrecomputedSchedule = Array.isArray(initialData?.todaySchedule);
    const hasPrecomputedStats = Boolean(initialData?.stats);
    const canUseInitialSnapshot =
      Boolean(initialData) &&
      courses.length > 0 &&
      hasPrecomputedCards &&
      hasPrecomputedSchedule &&
      hasPrecomputedStats;

    // Skip first refetch only when server snapshot is complete.
    if (canUseInitialSnapshot) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const [coursesRes, noticesRes, timetableRes] = await Promise.all([
        api.get<ApiResponse<any>>('/courses', { params: { facultyId: user.uid, limit: 200, offset: 0 } }),
        api.get<ApiResponse<any>>('/noticeboard', { params: { limit: 5 } }),
        api.get<ApiResponse<any>>('/timetable'),
      ]);

      let facultyCourses = coursesRes.data.data || [];
      const allNotices = noticesRes.data.data || [];
      const allTimetable = timetableRes.data.data || [];

      setNotices(allNotices);

      if (!facultyCourses.length) {
        let facultyName = user.fullName || user.name || '';
        try {
          const profileRes = await api.get<ApiResponse<any>>('/auth/profile');
          const profile = profileRes?.data?.data || profileRes?.data;
          facultyName = profile?.fullName || profile?.name || facultyName;
        } catch {
          // ignore profile fetch failure
        }

        const allCoursesRes = await api.get<ApiResponse<any>>('/courses', { params: { limit: 200, offset: 0 } });
        const allCourses = allCoursesRes.data.data || [];
        const name = String(facultyName || '').toLowerCase();
        facultyCourses = allCourses.filter((c: any) => {
          if (c.facultyId === user.uid || c.instructorId === user.uid) return true;
          if (!name) return false;
          const instructor = (c.instructor || c.facultyName || c.instructorName || '').toLowerCase();
          return instructor.includes(name);
        });
      }

      setCourses(facultyCourses);

      // Calculate Low Attendance Count
      const lowAttendanceCount = facultyCourses.length > 0 ? 0 : 0; // Placeholder or use actual logic if available

      const enrollmentResponses = await Promise.all(
        facultyCourses.map((course: any) =>
          api.get<ApiResponse<any>>('/enrollments', {
            params: { courseId: course.id, status: 'active', limit: 200, offset: 0 },
          })
        )
      );

      const allEnrollments = enrollmentResponses.flatMap((res) => res.data.data || []);
      const uniqueStudents = new Set(allEnrollments.map((e: any) => e.studentId));

      setStats({
        activeCount: facultyCourses.length,
        studentCount: uniqueStudents.size,
        lowAttendanceCount,
      });

      const enrollmentByCourse = allEnrollments.reduce((acc: Record<string, number>, item: any) => {
        const key = String(item.courseId || '');
        if (!key) return acc;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {});

      setCourseCards(
        facultyCourses.map((course: any) => ({
          id: course.id,
          code: course.code || 'COURSE',
          name: course.name || 'Course',
          students: enrollmentByCourse[String(course.id)] || 0,
          progress: 0,
          avgAttendance: 0,
        }))
      );

      // Prepare Today's Schedule
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const today = days[new Date().getDay()];
      const facultyTimetable = allTimetable.filter((t: any) => 
        facultyCourses.some(c => c.id === t.courseId) && t.day === today
      );

      setTodaySchedule(facultyTimetable.map((t: any) => {
        const course = facultyCourses.find(c => c.id === t.courseId);
        return {
          id: t.id,
          time: `${t.startTime} - ${t.endTime}`,
          course: course?.name || 'Class',
          section: t.section || 'N/A',
          room: t.room || 'TBA',
          students: enrollmentByCourse[String(t.courseId)] || 0,
          status: 'upcoming' as const,
        };
      }));

      if (facultyCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(facultyCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedCourse, initialData, courses.length]);

  useEffect(() => {
    if (authLoading) return;

    if (!user || user.role !== 'faculty') {
      router.replace('/auth');
      return;
    }

    void fetchFacultyData();
  }, [authLoading, user, router, fetchFacultyData]);

  const handleGenerateQR = () => {
    if (!selectedCourse) {
      toast.error('Please select a course first');
      return;
    }
    setShowQRModal(true);
  };

  return {
    loading,
    user,
    courses,
    notices,
    courseCards,
    todaySchedule,
    stats,
    selectedCourse,
    setSelectedCourse,
    showQRModal,
    setShowQRModal,
    showScheduleManager,
    setShowScheduleManager,
    handleGenerateQR,
    router,
  };
}
