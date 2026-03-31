import { serverFetch } from '@/lib/server-data';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { DepartmentsView } from '@/modules/departments/views/DepartmentsView';

export const metadata = {
  title: 'Departments | PEC APP ERP',
  description: 'Manage institutional academic departments and departmental leadership.',
};

export default async function DepartmentsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/auth');
  }

  const isAdmin = ['college_admin', 'super_admin', 'admin'].includes(session.role || '');
  
  // Pre-fetch departments on the server
  const departments = await serverFetch('/departments?limit=100');

  return (
    <DepartmentsView 
      initialDepartments={departments || []} 
      isAdmin={isAdmin}
    />
  );
}
