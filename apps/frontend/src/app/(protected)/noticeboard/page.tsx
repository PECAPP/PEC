import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server-data';
import NoticeboardClient from './NoticeboardClient';

export const metadata = {
  title: 'Noticeboard | PEC APP',
  description: 'Campus-wide announcements and academic updates',
};

export default async function NoticeboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  if (!['student', 'faculty', 'college_admin'].includes(session.role || '')) {
    redirect('/dashboard');
  }

  // Pre-fetch initial notices
  let initialNotices = [];
  try {
    const data = await serverFetch('/noticeboard?limit=200&offset=0');
    initialNotices = Array.isArray(data) ? data : data?.data || [];
  } catch (error) {
    console.error('Failed to pre-fetch notices:', error);
  }

  return (
    <NoticeboardClient initialNotices={initialNotices} session={session} />
  );
}
