"use client";
import { AppShellSkeleton } from "@pec/ui";
import { useAuth } from '@/features/auth/hooks/useAuth';
import StudentHostelView from './components/StudentHostelView';
import AdminHostelView from './components/AdminHostelView';
import { Loader2 } from 'lucide-react';

export default function HostelsPage() {
  const { ability, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <AppShellSkeleton />
      </div>
    );
  }

  // If the user has permission to manage HostelIssue, show the admin view
  if (ability?.can('manage', 'HostelIssue' as any)) {
    return <AdminHostelView />;
  }

  // Otherwise, show the student view
  return <StudentHostelView />;
}
