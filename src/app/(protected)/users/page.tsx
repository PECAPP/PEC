import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { UserManagementView } from '@/modules/users/views/UserManagementView';

export const metadata = {
  title: 'Identity Governance | PEC APP ERP',
  description: 'Institutional management of students, faculty, and administrative personnel.',
};


async function getUsers(token: string) {
  const API_URL = process.env.INTERNAL_API_URL || process.env.BACKEND_API_URL || "http://localhost:4000";
  // Strip trailing slash if present
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  try {
     // Use absolute URL for server-side fetch
     const url = new URL('/users', base).toString();
     const res = await fetch(url, { 
        method: 'GET',
        headers: {
           'Authorization': `Bearer ${token}`,
           'Content-Type': 'application/json',
           'Accept': 'application/json'
        },
        next: { revalidate: 60 } 
     });
     
     if (!res.ok) {
        console.error(`Users fetch failed: ${res.status} ${res.statusText}`);
        return [];
     }
     
     const data = await res.json();
     // Handle both nested (data.data) and flat (data) response formats
     const users = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
     return users.map((u: any) => ({
        ...u,
        fullName: u.fullName || u.name || '',
        status: u.status || 'active',
     }));
  } catch (error) {
     console.error('Error fetching users server-side:', error);
     return [];
  }
}

export default async function UsersPage() {
  const session = await getServerSession();
  if (!session) redirect('/auth');

  // RBAC Check on Server
  if (session.role !== 'college_admin' && session.role !== 'faculty') {
    redirect('/dashboard');
  }

  const users = await getUsers(session.token);

  return (
    <UserManagementView 
      initialUsers={users} 
      isAdmin={session.role === 'college_admin'} 
      isFaculty={session.role === 'faculty'} 
    />
  );
}
