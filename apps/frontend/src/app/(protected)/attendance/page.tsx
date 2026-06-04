import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server-data';
import AttendanceView from '@/modules/attendance/views/AttendanceView';

export const metadata = {
  title: 'Attendance Tracking | PEC APP',
  description: 'Manage and track institutional academic attendance and compliance.',
};

export default async function AttendancePage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  // Pre-fetch initial data for students
  let initialData: any = null;
  if (session.role === 'student' && session.uid) {
    const [summary, records] = await Promise.all([
      serverFetch('/attendance/summary'),
      serverFetch(`/attendance?studentId=${session.uid}&limit=100`),
    ]);
    initialData = { summary, records };
  } else {
    // For faculty/admin, pre-fetch their courses
    const courses =
      session.role === 'faculty'
        ? await serverFetch(`/courses?facultyId=${session.uid}&limit=100`)
        : await serverFetch('/courses?limit=100');
    initialData = { courses };
  }

  return (
    <AttendanceView 
      session={session} 
      initialData={initialData} 
    />
  );
}
