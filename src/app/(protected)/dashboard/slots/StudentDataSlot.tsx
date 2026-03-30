// Async server component — streams student data independently of other dashboard slots.
import { serverFetch } from '@/lib/server-data';
import { StudentDashboard } from '../dashboards/StudentDashboard';

export async function StudentDataSlot({ session }: { session: any }) {
  const [summary, courses, timetable, profile] = await Promise.all([
    serverFetch('/attendance/summary'),
    serverFetch('/courses?limit=10'),
    serverFetch('/timetable?limit=10'),
    serverFetch('/auth/profile'),
  ]);

  return (
    <StudentDashboard
      initialData={{ summary, courses, timetable }}
      user={{
        fullName: profile?.fullName || session.fullName || 'Scholar',
        department: profile?.department || 'Engineering',
        semester: profile?.semester || 1,
        enrollmentNumber: profile?.enrollmentNumber || 'PEC/2021/001',
      }}
    />
  );
}
