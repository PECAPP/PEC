import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/server-auth';
import AuthClient from './AuthClient';

/**
 * Server-side Auth page.
 * Handles initial session check to prevent client-side flicker.
 */
export default async function AuthPage() {
  const user = await getServerSession();

  // Only redirect if a valid session with identity is present.
  if (user) {
    return redirect('/dashboard');
  }

  return (
    <main className="bg-background">
      <AuthClient initialSessionStatus={false} />
    </main>
  );
}

// Metadata for SEO and appearance
export const metadata = {
  title: 'Identity Verification | Punjab Engineering College',
  description: 'Secure institutional sign-in for the PEC APP ERP and academic orchestration platform.',
};
