import { Loader } from "@pec/ui";
import { Suspense } from 'react';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { ProtectedLayoutClient } from './ProtectedLayoutClient';

export const dynamic = 'force-dynamic';

// 1. Separate the dynamic auth part from the static layout entry
async function AuthGate({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) {
    redirect('/auth');
  }
  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>;
}

// 2. Minimal fallback — shown only on hard initial load while AuthGate resolves.
// Client-side navigations (Link clicks) do NOT re-trigger this because the
// layout is already mounted; only the children (page slot) swaps.
function LayoutLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="mesh-gradient-bg">
        <div className="mesh-gradient-item mesh-1" />
        <div className="mesh-gradient-item mesh-2" />
        <div className="mesh-gradient-item mesh-3" />
      </div>

      {/* Structural Shell */}
      <div className="absolute inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:block">
        <div className="sidebar-mesh" />
      </div>
      <div className="absolute top-0 right-0 left-0 h-16 bg-background border-b border-sidebar-border lg:left-64" />

      {/* Inline progress bar — not full-screen block */}
      <div className="pt-24 lg:pl-64 p-3 md:p-6 flex items-center justify-center">
        <Loader inline />
      </div>
    </div>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<LayoutLoading />}>
      <AuthGate>{children}</AuthGate>
    </Suspense>
  );
}
