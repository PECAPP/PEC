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
  const [courseCards, setCourseCards] = useState<any[]>(initialData?.courseCards || []);
  const [todaySchedule, setTodaySchedule] = useState<any[]>(initialData?.todaySchedule || []);
  const [loading, setLoading] = useState(!initialData);
  const [stats, setStats] = useState(initialData?.stats || { activeCount: 0, studentCount: 0, lowAttendanceCount: 0 });

  const fetchFacultyData = useCallback(async () => {
    if (!user || user.role !== 'faculty') return;
    
    // If we already have initial data and it's fresh, skip first fetch
    if (initialData && courses.length > 0) {
       setLoading(false);
       return;
    }

    try {
      type ApiResponse<T> = { success: boolean; data: T; meta?: any };
      const [coursesRes, enrollmentsRes] = await Promise.all([
        api.get<ApiResponse<any>>('/courses', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any>>('/enrollments', { params: { limit: 200, offset: 0 } }),
      ]);

      const allCourses = coursesRes.data.data || [];
      const allEnrollments = enrollmentsRes.data.data || [];

      // Filter courses by instructor name
      const facultyCourses = allCourses.filter((c: any) => 
        c.instructor && user.fullName && c.instructor.toLowerCase().includes(user.fullName.toLowerCase())
      );

      setCourses(facultyCourses);

      const uniqueStudents = new Set(
        allEnrollments
          .filter((e: any) => facultyCourses.some((c: any) => c.id === e.courseId))
          .map((e: any) => e.studentId)
      );

      setStats({
        activeCount: facultyCourses.length,
        studentCount: uniqueStudents.size,
        lowAttendanceCount: 0,
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

      setTodaySchedule(Array.isArray(initialData?.todaySchedule) ? initialData.todaySchedule : []);

      if (facultyCourses.length > 0 && !selectedCourse) {
        setSelectedCourse(facultyCourses[0]);
      }
    } catch (error) {
      console.error('Error fetching faculty data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, selectedCourse]);

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
