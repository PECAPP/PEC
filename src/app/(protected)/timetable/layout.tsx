import { Metadata } from 'next';

export const experimental_ppr = true;

export const metadata: Metadata = {
  title: 'Timetable | OmniFlow ERP',
  description: 'Manage and view your academic schedule.',
};

export default function TimetableLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
