import { serverFetch } from '@/lib/server-data';
import { InteractiveCalendar } from '@/components/academic-calendar/InteractiveCalendar';
import { getServerSession } from '@/lib/server-auth';
import AdminAcademicCalendarPage from '../admin/academic-calendar/page';

export default async function AcademicCalendarPage() {
  const session = await getServerSession();
  const isAdmin = ['college_admin', 'super_admin', 'admin'].includes(session?.role || '');

  if (isAdmin) {
    return <AdminAcademicCalendarPage />;
  }

  let events = [];

  try {
    events = await serverFetch('/academic-calendar');
  } catch (error) {
    console.error('Failed to fetch calendar events:', error);
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <InteractiveCalendar events={events || []} isAdmin={false} />
    </div>
  );
}
