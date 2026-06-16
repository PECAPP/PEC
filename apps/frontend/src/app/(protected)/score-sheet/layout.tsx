import { RoleGuard } from '@/components/auth/RoleGuard';

export default function ScoreSheetLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard permission={{ action: 'read', subject: 'CgpaEntry' }}>
      {children}
    </RoleGuard>
  );
}
