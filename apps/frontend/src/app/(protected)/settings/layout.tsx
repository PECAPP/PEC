import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Platform Settings | PEC APP ERP',
  description: 'Manage institutional account preferences and configurations.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
