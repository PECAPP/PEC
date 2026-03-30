import { Suspense } from 'react';
import { getServerSession } from '@/lib/server-auth';
import { redirect } from 'next/navigation';
import { ProtectedLayoutClient } from './ProtectedLayoutClient';
import { Loader } from '@/components/ui/Loader';

// 1. Separate the dynamic auth part from the static layout entry
async function AuthGate({ children }: { children: React.ReactNode }) {
  const user = await getServerSession();
  if (!user) {
    redirect('/auth');
  }
  return <ProtectedLayoutClient user={user}>{children}</ProtectedLayoutClient>;
}

// 2. Initial static shell for PPR (Partial Prerendering)
function LayoutLoading() {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Structural Shell */}
      <div className="absolute inset-y-0 left-0 w-64 bg-sidebar border-r border-sidebar-border hidden lg:block" />
      <div className="absolute top-0 right-0 left-0 h-16 bg-background border-b border-sidebar-border lg:left-64" />
      
      {/* Branded Loading Content */}
      <div className="pt-24 lg:pl-64 p-6 flex items-center justify-center">
        <Loader fullScreen={false} />
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
