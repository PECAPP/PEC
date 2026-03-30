'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { fetchAllPages } from '@/lib/fetchAllPages';
import { toast } from 'sonner';

type FacultyStats = {
  activeCount: number;
  studentCount: number;
  avgAttendance: number;
  lowAttendanceCount: number;
  pendingReviews: number;
};

type FacultyCourseCard = {
  id: string;
  code: string;
  name: string;
  students: number;
  progress: number;
  avgAttendance: number;
};

type FacultyScheduleItem = {
  id: string;
  time: string;
  course: string;
  section: string;
  room: string;
  students: number;
  status: 'completed' | 'ongoing' | 'upcoming';
};

const parseTimeToMinutes = (value?: string | null) => {
  if (!value) return null;
  const [h, m] = value.split(':').map((v) => Number(v));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return h * 60 + m;
};

export function useFacultyDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [courseCards, setCourseCards] = useState<FacultyCourseCard[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<FacultyScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<FacultyStats>({
    activeCount: 0,
    studentCount: 0,
    avgAttendance: 0,
    lowAttendanceCount: 0,
    pendingReviews: 0,
  });

  const fetchFacultyData = useCallback(async () => {
    if (!user) return;
    try {
      const [allCourses, allEnrollments, allAttendance, allTimetable] = await Promise.all([
        fetchAllPages<any>('/courses'),
        fetchAllPages<any>('/enrollments', { status: 'active' }),
        fetchAllPages<any>('/attendance'),
        fetchAllPages<any>('/timetable'),
      ]);

      // Filter courses by instructor name
      const facultyCourses = allCourses.filter((c: any) => 
        (c.facultyId && c.facultyId === user.uid) ||
        (c.instructor &&
          user.fullName &&
          String(c.instructor).toLowerCase().includes(String(user.fullName).toLowerCase()))
      );

      setCourses(facultyCourses);

      const facultyCourseIds = new Set(facultyCourses.map((c: any) => c.id));
      const facultyCourseCodes = new Set(
        facultyCourses.map((c: any) => String(c.code || '').trim()).filter(Boolean),
      );
      const courseById = new Map(facultyCourses.map((c: any) => [c.id, c]));
      const enrollmentsForFaculty = allEnrollments.filter((e: any) =>
        facultyCourseIds.has(e.courseId),
      );
      const uniqueStudents = new Set(enrollmentsForFaculty.map((e: any) => e.studentId));

      const attendanceForFaculty = allAttendance.filter((record: any) => {
        const subject = String(record.subject || '').trim();
        return facultyCourseCodes.has(subject) || facultyCourseIds.has(subject);
      });

      const presentStatuses = new Set(['present', 'late']);
      const presentCount = attendanceForFaculty.filter((r: any) =>
        presentStatuses.has(String(r.status || '').toLowerCase()),
      ).length;
      const avgAttendance =
        attendanceForFaculty.length > 0
          ? Math.round((presentCount / attendanceForFaculty.length) * 100)
          : 0;

      const studentAttendance = new Map<string, { total: number; present: number }>();
      attendanceForFaculty.forEach((record: any) => {
        const sid = String(record.studentId || '');
        if (!sid) return;
        const current = studentAttendance.get(sid) || { total: 0, present: 0 };
        current.total += 1;
        if (presentStatuses.has(String(record.status || '').toLowerCase())) {
          current.present += 1;
        }
        studentAttendance.set(sid, current);
      });
      const lowAttendanceCount = Array.from(studentAttendance.values()).filter(
        (entry) => entry.total > 0 && (entry.present / entry.total) * 100 < 75,
      ).length;

      const enrollmentCountByCourse = new Map<string, number>();
      enrollmentsForFaculty.forEach((enrollment: any) => {
        enrollmentCountByCourse.set(
          enrollment.courseId,
          (enrollmentCountByCourse.get(enrollment.courseId) || 0) + 1,
        );
      });

      const attendanceByCourseCode = new Map<string, { total: number; present: number }>();
      attendanceForFaculty.forEach((record: any) => {
        const subject = String(record.subject || '').trim();
        const current = attendanceByCourseCode.get(subject) || { total: 0, present: 0 };
        current.total += 1;
        if (presentStatuses.has(String(record.status || '').toLowerCase())) {
          current.present += 1;
        }
        attendanceByCourseCode.set(subject, current);
      });

      const nextCourseCards: FacultyCourseCard[] = facultyCourses.map((course: any) => {
        const subjectStats =
          attendanceByCourseCode.get(String(course.code || '').trim()) ||
          attendanceByCourseCode.get(String(course.id || '').trim()) || { total: 0, present: 0 };
        const courseAvgAttendance =
          subjectStats.total > 0
            ? Math.round((subjectStats.present / subjectStats.total) * 100)
            : 0;
        return {
          id: course.id,
          code: course.code || 'N/A',
          name: course.name || 'Untitled Course',
          students: enrollmentCountByCourse.get(course.id) || 0,
          progress: Math.max(
            0,
            Math.min(100, Math.round((Number(course.semester || 1) / 8) * 100)),
          ),
          avgAttendance: courseAvgAttendance,
        };
      });
      setCourseCards(nextCourseCards);

      const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      const timetableForToday = allTimetable
        .filter((row: any) => {
          const rowDay = String(row.day || '').trim().toLowerCase();
          return (
            rowDay === todayName.toLowerCase() &&
            (facultyCourseIds.has(row.courseId) ||
              facultyCourseCodes.has(String(row.courseCode || '').trim()))
          );
        })
        .map((row: any) => {
          const start = parseTimeToMinutes(row.startTime);
          const end = parseTimeToMinutes(row.endTime);
          let status: FacultyScheduleItem['status'] = 'upcoming';
          if (start !== null && end !== null) {
            if (nowMinutes > end) status = 'completed';
            else if (nowMinutes >= start && nowMinutes <= end) status = 'ongoing';
          }
          const course =
            (row.courseId ? courseById.get(row.courseId) : undefined) ||
            facultyCourses.find((c: any) => c.code === row.courseCode);
          return {
            id: row.id,
            time: `${row.startTime || '--:--'} - ${row.endTime || '--:--'}`,
            course: course?.name || row.courseName || row.courseCode || 'Course',
            section: row.batch || `Sem ${row.semester || course?.semester || '-'}`,
            room: row.room || 'TBD',
            students: course ? enrollmentCountByCourse.get(course.id) || 0 : 0,
            status,
          };
        })
        .sort((a, b) => {
          const aStart = parseTimeToMinutes(a.time.split(' - ')[0]) ?? 0;
          const bStart = parseTimeToMinutes(b.time.split(' - ')[0]) ?? 0;
          return aStart - bStart;
        });
      setTodaySchedule(timetableForToday);

      setStats({
        activeCount: facultyCourses.length,
        studentCount: uniqueStudents.size,
        avgAttendance,
        lowAttendanceCount,
        pendingReviews: 0,
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
