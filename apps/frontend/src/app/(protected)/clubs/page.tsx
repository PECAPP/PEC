import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { serverFetch } from '@/lib/server-data';
import ClubsClient from './ClubsClient';

export default async function ClubsPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  let initialClubs: any[] = [];
  try {
    const fetched = await serverFetch('/chat/clubs');
    initialClubs = Array.isArray(fetched) ? fetched : [];
  } catch (error) {
    console.error('Failed to fetch initial clubs', error);
  }

  return <ClubsClient initialClubs={initialClubs} session={session} />;
}
