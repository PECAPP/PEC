import { serverFetch } from '@/lib/server-data';
import { InteractiveCalendar } from '@/components/academic-calendar/InteractiveCalendar';

export default async function AcademicCalendarPage() {
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
