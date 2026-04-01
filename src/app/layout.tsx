import type { Metadata } from 'next';
import { Inter, Sora } from 'next/font/google';
import { Providers } from './providers';
import { RouteTransitionLoader } from '@/components/layout/RouteTransitionLoader';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

const sora = Sora({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-display',
});

export const metadata: Metadata = {
  title: 'PEC App - Smart College Management System',
  description: 'Modern, intuitive campus management system for educational institutions',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
      className={`accent-pec-gold ${inter.variable} ${sora.variable}`}
    >
      <body suppressHydrationWarning>
        <RouteTransitionLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
