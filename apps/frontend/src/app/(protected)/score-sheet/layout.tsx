import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ScoreSheetLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard roles={['college_admin', 'faculty']}>
      {children}
    </RoleGuard>
  );
}
