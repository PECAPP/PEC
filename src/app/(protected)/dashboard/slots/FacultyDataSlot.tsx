// Async server component — streams faculty dashboard data independently.
import { serverFetch } from '@/lib/server-data';
import { FacultyDashboard } from '../dashboards/FacultyDashboard';

export async function FacultyDataSlot({ session }: { session: any }) {
  const [courses, stats, profile] = await Promise.all([
    serverFetch(`/courses?facultyId=${session.uid}&limit=20`),
    serverFetch('/attendance/faculty-stats'),
    serverFetch('/auth/profile'),
  ]);

  return (
    <FacultyDashboard
      initialData={{ courses, stats }}
      user={{
        fullName: profile?.fullName || session.fullName || 'Professor',
        department: profile?.department || 'Academic',
      }}
    />
  );
}
