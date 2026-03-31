import { Metadata } from 'next';
import { LandingClient } from './LandingClient';

export const metadata: Metadata = {
  title: 'PEC APP | Institutional ERP Platform',
  description: 'The definitive institutional ERP platform for modern higher education. Experience seamless campus management, secure institutional messaging, and advanced student life-cycle tracking.',
  openGraph: {
    title: 'PEC APP | Institutional ERP and Academic Intelligence',
    description: 'The ultimate orchestration platform for colleges and universities.',
    images: [{ url: '/og-image.jpg' }],
  },
};

export default function LandingPage() {
  return <LandingClient />;
}
