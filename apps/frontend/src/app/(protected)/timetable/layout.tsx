import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Academic Timetable | PEC APP ERP',
  description: 'Manage and synchronize institutional academic schedules.',
};

export default function TimetableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
