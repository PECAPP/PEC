import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Settings | OmniFlow ERP',
  description: 'Manage your account and platform preferences.',
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
