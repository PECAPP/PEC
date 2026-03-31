// Async server component — streams faculty dashboard data independently.
import { serverFetch } from '@/lib/server-data';
import { FacultyDashboard } from '../dashboards/FacultyDashboard';

export async function FacultyDataSlot({ session }: { session: any }) {
  let courses = [];
  let stats = null;
  let profile = null;
  let notices = [];

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
      initialData={{ courses, stats, notices }}
      user={{
        fullName: profile?.fullName || session.fullName || 'Professor',
        department: profile?.department || 'Academic',
      }}
    />
  );
}
