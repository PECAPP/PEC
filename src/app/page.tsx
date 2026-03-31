import { Metadata } from 'next';
import { LandingClient } from './LandingClient';

export const metadata: Metadata = {
  title: 'OmniFlow | Modern Campus ERP',
  description: 'The all-in-one platform for modern education. Experience seamless campus management, real-time messaging, and student tracking.',
  openGraph: {
    title: 'OmniFlow | Experience the Future of Campus Management',
    description: 'The ultimate tool for colleges and universities.',
    images: [{ url: '/og-image.jpg' }],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
