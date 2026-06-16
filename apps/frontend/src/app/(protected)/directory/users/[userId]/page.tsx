import { getServerSession } from '@/lib/server-auth';
import { cookies } from 'next/headers';
import { redirect, notFound } from 'next/navigation';
import { UserDetailView } from './UserDetailView';
import { buildAbilityFor } from '@/lib/casl-ability';

interface PageProps {
  params: Promise<{ userId: string }>;
}

async function getUserData(userId: string) {
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  try {
     const userRes = await fetch(`${base}/users/${userId}`, { 
        headers: {
           'Cookie': (await cookies()).toString(),
           'Content-Type': 'application/json'
        },
        next: { revalidate: 60 } 
     });
     if (!userRes.ok) return null;
     const data = await userRes.json();
     return data.data || data;
  } catch (error) {
     console.error('Error fetching user server-side:', error);
     return null;
  }
}

async function getStudentStats(userId: string) {
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;

  try {
     const reqHeaders = { 'Cookie': (await cookies()).toString() };
     const [enrollmentsRes, gradesRes, attendanceRes] = await Promise.all([
        fetch(`${base}/enrollments?studentId=${userId}`, { headers: reqHeaders, next: { revalidate: 60 } }),
        fetch(`${base}/examinations/grades?studentId=${userId}`, { headers: reqHeaders, next: { revalidate: 60 } }),
        fetch(`${base}/attendance?studentId=${userId}`, { headers: reqHeaders, next: { revalidate: 60 } }),
     ]);

     const enrollmentsData = enrollmentsRes.ok ? (await enrollmentsRes.json()).data : [];
     const gradesRaw = gradesRes.ok ? (await gradesRes.json()).data : [];
     const attendanceData = attendanceRes.ok ? (await attendanceRes.json()).data : [];

     return {
        enrollments: enrollmentsData || [],
        grades: gradesRaw || [],
        attendance: attendanceData || [],
     };
  } catch (e) {
     console.error(e);
     return { enrollments: [], grades: [], attendance: [] };
  }
}

export default async function UserDetailPage({ params }: PageProps) {
  const { userId } = await params;
  const session = await getServerSession();
  if (!session) redirect('/auth');

  const ability = buildAbilityFor(session.caslPermissions, session.role);
  if (!ability.can('read', 'User') && session.uid !== userId) {
    redirect('/dashboard');
  }

  const user = await getUserData(userId);
  if (!user) notFound();

  let studentData = { enrollments: [], grades: [], attendance: [] };
  if (user.role === 'student' || user.role === 'user') {
     studentData = await getStudentStats(userId);
  }

  return (
    <UserDetailView 
      user={user}
      enrollments={studentData.enrollments}
      grades={studentData.grades}
      attendance={studentData.attendance}
      payments={[]}
      hostelIssues={[]}
    />
  );
}
