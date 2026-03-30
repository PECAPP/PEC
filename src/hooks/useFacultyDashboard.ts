'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import api from '@/lib/api';
import { toast } from 'sonner';

export function useFacultyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ activeCount: 0, studentCount: 0 });

  const fetchFacultyData = useCallback(async () => {
    if (!user) return;
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
      });

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
