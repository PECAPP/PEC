import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | OmniFlow ERP',
  description: 'Manage your personal and academic profile.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
