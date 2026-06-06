import { serverFetch } from '@/lib/server-data';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { ChatView } from './ChatView';

export const metadata = {
  title: 'Secure Messaging | PEC APP ERP',
  description: 'Synchronized communication across the institutional ecosystem.',
};

export default async function ChatPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  // Pre-fetch chat rooms on the server
  const rooms = await serverFetch('/chat/rooms?limit=50');

  return (
    <ChatView 
      user={{
        uid: session.uid,
        role: session.role,
        fullName: session.fullName,
      }}
      initialRooms={rooms || []} 
    />
  );
}
