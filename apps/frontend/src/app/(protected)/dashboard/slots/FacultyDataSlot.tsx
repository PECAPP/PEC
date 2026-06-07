// Async server component — streams faculty dashboard data independently.
import { serverFetch } from '@/lib/server-data';
import { FacultyDashboard } from '../dashboards/FacultyDashboard';

export async function FacultyDataSlot({ session }: { session: any }) {
  let courses: any[] = [];
  let stats: Record<string, any> | null = null;
  let profile: Record<string, any> | null = null;
  let notices: any[] = [];

  try {
    [stats, profile, notices] = await Promise.all([
      serverFetch('/attendance/faculty-stats'),
      serverFetch('/auth/profile'),
      serverFetch('/noticeboard?limit=5'),
    ]);

    const scopedCourses = await serverFetch(`/courses?facultyId=${session.uid}&limit=200`);
    courses = Array.isArray(scopedCourses) ? scopedCourses : [];

    if (!courses.length) {
      const allCourses = await serverFetch('/courses?limit=200');
      const facultyName = String(
        profile?.fullName || profile?.name || session.fullName || ''
      ).toLowerCase();
      const safeAllCourses = Array.isArray(allCourses) ? allCourses : [];
      courses = safeAllCourses.filter((course: any) => {
        if (course.facultyId === session.uid || course.instructorId === session.uid) {
          return true;
        }
        if (!facultyName) return false;
        const instructor = String(
          course.instructor || course.facultyName || course.instructorName || ''
        ).toLowerCase();
        return instructor.includes(facultyName);
      });
    }
  } catch (err) {
    console.error('[FacultyDataSlot] SSR Fetch Error:', err);
  }

  return (
    <FacultyDashboard
      initialData={{
        courses: Array.isArray(courses) ? courses : [],
        stats: stats ?? undefined,
        notices: Array.isArray(notices) ? notices : [],
      }}
      user={{
        uid: session.uid,
        role: 'faculty',
        email: profile?.email || session.email || null,
        fullName: profile?.fullName || session.fullName || 'Professor',
        name: profile?.name || profile?.fullName || session.fullName || 'Professor',
        department: profile?.department || 'Academic',
      }}
    />
  );
}
