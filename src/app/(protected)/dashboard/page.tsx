import { Suspense } from 'react';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { StudentDataSlot } from './slots/StudentDataSlot';
import { FacultyDataSlot } from './slots/FacultyDataSlot';
import { AdminDataSlot } from './slots/AdminDataSlot';

// Opt this page into Partial Prerendering (Next.js 16)
// The static shell renders instantly; user-data slots stream in.
export const experimental_ppr = true;

export const metadata = {
  title: 'Dashboard | OmniFlow ERP',
  description: 'Your personalized campus command center.',
};

// ─── Skeleton Fallbacks ────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-muted rounded-xl" />
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted rounded-xl" />)}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <div className="lg:col-span-2 h-64 bg-muted rounded-xl" />
        <div className="h-64 bg-muted rounded-xl" />
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession();

  if (!session) redirect('/auth');
  if (!session.role) redirect('/role-selection');

  // Each Role-Slot is wrapped in <Suspense> so Next.js can:
  // 1. Send the static shell immediately (PPR)
  // 2. Stream each slot's HTML chunk as its async server component resolves
  if (session.role === 'student') {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <StudentDataSlot session={session} />
      </Suspense>
    );
  }

  if (session.role === 'faculty') {
    return (
      <Suspense fallback={<DashboardSkeleton />}>
        <FacultyDataSlot session={session} />
      </Suspense>
    );
  }

  // Admin (college_admin / super_admin)
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <AdminDataSlot />
    </Suspense>
  );
}
