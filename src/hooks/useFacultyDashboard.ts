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
  const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
  const [courseCards, setCourseCards] = useState<any[]>([]);
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
      const [coursesRes, enrollmentsRes, noticesRes, timetableRes] = await Promise.all([
        api.get<ApiResponse<any>>('/courses', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any>>('/enrollments', { params: { limit: 200, offset: 0 } }),
        api.get<ApiResponse<any>>('/noticeboard', { params: { limit: 5 } }),
        api.get<ApiResponse<any>>('/timetable'),
      ]);

      const allCourses = coursesRes.data.data || [];
      const allEnrollments = enrollmentsRes.data.data || [];
      const allNotices = noticesRes.data.data || [];
      const allTimetable = timetableRes.data.data || [];

      setNotices(allNotices);

      // Filter courses by instructor name
      const facultyCourses = allCourses.filter((c: any) => 
        c.instructor && user.fullName && c.instructor.toLowerCase().includes(user.fullName.toLowerCase())
      );

      setCourses(facultyCourses);

      // Calculate Low Attendance Count (Dummy logic for now, should be from attendance service)
      const lowAttendanceCount = facultyCourses.length > 0 ? 3 : 0; 

      const uniqueStudents = new Set(
        allEnrollments
          .filter((e: any) => facultyCourses.some((c: any) => c.id === e.courseId))
          .map((e: any) => e.studentId)
      );

      setStats({
        activeCount: facultyCourses.length,
        studentCount: uniqueStudents.size,
        lowAttendanceCount,
      });

      // Prepare Course Cards
      setCourseCards(facultyCourses.map(c => ({
        id: c.id,
        code: c.code,
        name: c.name,
        students: allEnrollments.filter((e: any) => e.courseId === c.id).length,
        attendance: 85, // Placeholder
      })));

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
          students: allEnrollments.filter((e: any) => e.courseId === t.courseId).length,
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
