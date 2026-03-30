'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Loader2, MapPin, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/common/AsyncState';
import { usePermissions } from '@/hooks/usePermissions';
import api from '@/lib/api';
import { toast } from 'sonner';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    limit?: number;
    offset?: number;
  };
}

interface CourseDetail {
  id: string;
  code: string;
  name: string;
  department: string;
  credits: number;
  semester: number;
  instructor?: string | null;
  facultyName?: string | null;
  description?: string | null;
}

interface TimetableItem {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  room?: string | null;
}

interface EnrollmentItem {
  id: string;
  courseId: string;
}

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isStudent, loading: authLoading } = usePermissions();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [schedule, setSchedule] = useState<TimetableItem[]>([]);
  const [enrollmentId, setEnrollmentId] = useState<string | null>(null);

  const isEnrolled = useMemo(() => !!enrollmentId, [enrollmentId]);

  const fetchCourse = useCallback(async () => {
    if (!id) return;

    const [courseResult, scheduleResult, enrollmentResult] = await Promise.allSettled([
      api.get<ApiResponse<CourseDetail>>(`/courses/${id}`),
      api.get<ApiResponse<TimetableItem[]>>('/timetable', {
        params: { limit: 200, offset: 0, courseId: id },
      }),
      isStudent && user?.uid
        ? api.get<ApiResponse<EnrollmentItem[]>>('/enrollments', {
            params: { limit: 1, offset: 0, courseId: id, status: 'active' },
          })
        : Promise.resolve({ data: { success: true, data: [] as EnrollmentItem[] } }),
    ]);

    if (courseResult.status === 'rejected') {
      throw courseResult.reason;
    }

    const courseData = courseResult.value.data.data;
    setCourse(courseData);

    if (scheduleResult.status === 'fulfilled') {
      const normalized = (scheduleResult.value.data.data || [])
        .map((slot) => ({
          ...slot,
          room: slot.room || 'TBD',
        }))
        .sort((a, b) => {
          const dayDiff = DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day);
          if (dayDiff !== 0) return dayDiff;
          return a.startTime.localeCompare(b.startTime);
        });
      setSchedule(normalized);
    } else {
      setSchedule([]);
    }

    if (enrollmentResult.status === 'fulfilled') {
      const enrollment = enrollmentResult.value.data.data?.[0];
      setEnrollmentId(enrollment?.id ?? null);
    } else {
      setEnrollmentId(null);
    }
  }, [id, isStudent, user?.uid]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/auth');
      return;
    }

    const load = async () => {
      setLoading(true);
      try {
        await fetchCourse();
      } catch (error) {
        console.error('Failed to load course details:', error);
        toast.error('Failed to load course details');
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [authLoading, user, router, fetchCourse]);

  const handleEnroll = async () => {
    if (!course || !isStudent || !user?.uid || submitting) return;

    setSubmitting(true);
    try {
      await api.post('/enrollments', {
        studentId: user.uid,
        courseId: course.id,
        courseName: course.name,
        courseCode: course.code,
        semester: course.semester,
        status: 'active',
      });
      toast.success(`Enrolled in ${course.code}`);
      await fetchCourse();
    } catch (error) {
      console.error('Failed to enroll:', error);
      toast.error('Failed to enroll in this course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDrop = async () => {
    if (!enrollmentId || !isStudent || submitting) return;

    setSubmitting(true);
    try {
      await api.patch(`/enrollments/${enrollmentId}`, { status: 'dropped' });
      toast.success('Course dropped');
      await fetchCourse();
    } catch (error) {
      console.error('Failed to drop enrollment:', error);
      toast.error('Failed to drop this course');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => router.push('/courses')} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Button>
        <EmptyState title="Course not found" description="The requested course could not be loaded." />
      </div>
    );
  }

  const instructor = course.facultyName || course.instructor || 'TBA';

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 md:space-y-8">
      <Button variant="ghost" onClick={() => router.push('/courses')} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Button>

      <div className="card-elevated ui-card-pad space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{course.code}</Badge>
              <Badge variant="secondary">Semester {course.semester}</Badge>
            </div>
            <h1 className="text-2xl font-bold text-foreground">{course.name}</h1>
            <p className="text-muted-foreground">{course.department}</p>
          </div>
          {isStudent && (
            <div className="flex gap-2">
              {isEnrolled ? (
                <Button variant="destructive" onClick={handleDrop} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Drop Course
                </Button>
              ) : (
                <Button onClick={handleEnroll} disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Enroll
                </Button>
              )}
            </div>
          )}
        </div>

        <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-primary" />
            {course.credits} credits
          </div>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            {instructor}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Weekly schedule below
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">Description</p>
          <p className="text-sm text-muted-foreground">{course.description || 'No description provided for this course yet.'}</p>
        </div>
      </div>

      <div className="card-elevated ui-card-pad space-y-3">
        <p className="text-base font-semibold text-foreground">Schedule</p>
        {schedule.length === 0 ? (
          <EmptyState title="No timetable yet" description="This course does not have schedule entries yet." />
        ) : (
          <div className="space-y-2">
            {schedule.map((slot) => (
              <div key={slot.id} className="flex items-center gap-3 rounded-md border border-border bg-card/50 p-3 text-sm">
                <span className="w-24 font-medium text-foreground">{slot.day}</span>
                <span className="text-muted-foreground">{slot.startTime} - {slot.endTime}</span>
                <span className="ml-auto flex items-center gap-1 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {slot.room}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
