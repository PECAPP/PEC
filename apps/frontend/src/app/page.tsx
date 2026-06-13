import { Metadata } from 'next';
import { LandingClient } from './LandingClient';

export const metadata: Metadata = {
  title: 'PEC APP | Institutional ERP Platform',
  description: 'The official unified platform for Punjab Engineering College. Experience seamless campus management, secure institutional messaging, and advanced student life-cycle tracking.',
  openGraph: {
    title: 'PEC APP | Institutional ERP and Academic Intelligence',
    description: 'The official unified platform for Punjab Engineering College.',
    images: [{ url: '/og-image.jpg' }],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
