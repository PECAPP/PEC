"use client";
import { AppShellSkeleton } from "@pec/ui";
import { useAuth } from '@/features/auth/hooks/useAuth';
import StudentCanteenView from './components/StudentCanteenView';
import ManagerCanteenView from './components/ManagerCanteenView';
import { Loader2 } from 'lucide-react';

export default function CanteenPage() {
  const { ability, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center min-h-[400px]">
        <AppShellSkeleton />
      </div>
    );
  }

  // If the user has permission to manage all (or specifically the canteen), show the manager view
  if (ability?.can('manage', 'all' as any)) {
    return <ManagerCanteenView />;
  }

  // Otherwise, show the student view
  return <StudentCanteenView />;
}
