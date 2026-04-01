// Async server component — streams faculty dashboard data independently.
import { serverFetch } from '@/lib/server-data';
import { FacultyDashboard } from '../dashboards/FacultyDashboard';

export async function FacultyDataSlot({ session }: { session: any }) {
  let courses: any[] = [];
  let stats: Record<string, any> | null = null;
  let profile: Record<string, any> | null = null;
  let notices: any[] = [];

  try {
    [courses, stats, profile, notices] = await Promise.all([
      serverFetch(`/courses?facultyId=${session.uid}&limit=20`),
      serverFetch('/attendance/faculty-stats'),
      serverFetch('/auth/profile'),
      serverFetch('/noticeboard?limit=5'),
    ]);
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
