import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import { Providers } from './providers';
import { RouteTransitionLoader } from '@/components/layout/RouteTransitionLoader';
import { cookies } from 'next/headers';
import { getServerSession } from '@/lib/server-auth';
import { AuthProvider } from '@/features/auth/hooks/useAuth';
import './globals.css';

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'PEC App - Smart College Management System',
  description: 'Modern, intuitive campus management system for educational institutions',
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  icons: {
    icon: '/logo.png',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const savedAccent = cookieStore.get('accent-color')?.value || 'pec-gold';
  
  // Fetch session on the root layout so AuthContext is available globally
  const user = await getServerSession();

  return (
    <html 
      lang="en" 
      suppressHydrationWarning 
      data-scroll-behavior="smooth"
      className={`accent-${savedAccent} ${bricolage.variable}`}
    >
      <body suppressHydrationWarning className="font-sans">
        <RouteTransitionLoader />
        <Providers>
          <AuthProvider initialSession={user}>
            {children}
          </AuthProvider>
        </Providers>
      </body>
    </html>
  );
}
