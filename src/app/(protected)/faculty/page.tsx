import { serverFetch } from '@/lib/server-data';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { FacultyView } from './FacultyView';

export const metadata = {
  title: 'Faculty | OmniFlow ERP',
  description: 'View and manage university faculty members and departments.',
};

export default async function FacultyPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  const isAdmin = ['college_admin', 'super_admin', 'admin'].includes(session.role || '');
  
  // Pre-fetch faculty on the server
  // Note: we're reusing /users with role=faculty filter
  const faculty = await serverFetch('/users?limit=100&role=faculty');

  return (
    <FacultyView 
      initialFaculty={faculty || []} 
      isAdmin={isAdmin}
    />
  );
}
