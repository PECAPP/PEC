// Async server component — streams student data independently of other dashboard slots.
import { serverFetch } from '@/lib/server-data';
import { StudentDashboard } from '../dashboards/StudentDashboard';

export async function StudentDataSlot({ session }: { session: any }) {
  const [summary, courses, timetable, profile, noticeboard] = await Promise.all([
    serverFetch('/attendance/summary'),
    serverFetch('/courses'),
    serverFetch('/timetable'),
    serverFetch('/auth/profile'),
    serverFetch('/noticeboard?limit=4&offset=0'),
  ]);

  return (
    <StudentDashboard
      initialData={{ summary, courses, timetable, noticeboard: noticeboard ?? [] }}
      user={{
        fullName: profile?.fullName || session.fullName || 'Scholar',
        department: profile?.department || 'Engineering',
        semester: profile?.semester || 1,
        enrollmentNumber: profile?.enrollmentNumber || 'PEC/2021/001',
      }}
    />
  );
}
