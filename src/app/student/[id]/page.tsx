import { StudentProfileView } from './ProfileView';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { getServerSession } from '@/lib/server-auth';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getStudentData(id: string, token?: string) {
  const API_URL = process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const base = API_URL.endsWith('/') ? API_URL.slice(0, -1) : API_URL;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const [userRes, profileRes, summaryRes] = await Promise.all([
      fetch(`${base}/users/${id}`, { headers, next: { revalidate: 60 } }),
      fetch(`${base}/student-profiles/${id}`, { headers, next: { revalidate: 60 } }),
      token ? fetch(`${base}/attendance/summary?studentId=${id}`, { headers, next: { revalidate: 60 } }) : Promise.resolve(null),
    ]);

    if (!userRes.ok) return null;
    const userData = (await userRes.json()).data;

    const profileData = profileRes?.ok ? (await profileRes.json()).data : null;
    const summaryData = summaryRes && summaryRes.ok ? (await summaryRes.json()).data : null;

    return { userData, profileData, summaryData };
  } catch (error) {
    console.error('Error fetching student server-side:', error);
    return null;
  }
}

async function getGithubStats(username: string) {
  if (!username) return null;
  try {
    const resp = await fetch(`https://api.github.com/users/${username.replace('@', '')}`, {
       next: { revalidate: 3600 } // Cache github stats for 1 hr
    });
    if (resp.ok) {
      const data = await resp.json();
      return {
        repos: data.public_repos,
        followers: data.followers,
        avatar: data.avatar_url,
      };
    }
  } catch (e) {
    console.error(e);
  }
  return null;
}

export default async function PublicStudentProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getServerSession();
  const data = await getStudentData(id, session?.token);

  if (!data || !data.userData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
        <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
          <User className="w-8 h-8 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold mb-2">User not found</h1>
        <p className="text-muted-foreground mb-6">The profile you are looking for does not exist.</p>
        <Link href="/">
          <Button>Go Home</Button>
        </Link>
      </div>
    );
  }

  const githubStats = data.profileData?.githubUsername 
    ? await getGithubStats(data.profileData.githubUsername)
    : null;

  const summary = data.summaryData;
  const stats = summary
    ? {
        attendance: summary.totalSummary?.percentage ?? null,
        credits: Array.isArray(summary.courses) ? summary.courses.length : null,
      }
    : null;

  return (
    <StudentProfileView 
      userData={data.userData}
      profileData={data.profileData || {}}
      stats={stats}
      githubStats={githubStats}
      currentUser={null} // We can get this from server cookies if needed
    />
  );
}
