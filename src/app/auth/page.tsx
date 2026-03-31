import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import AuthClient from './AuthClient';

/**
 * Server-side Auth page.
 * Handles initial session check to prevent client-side flicker.
 */
export default async function AuthPage() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  // Only redirect if a real access token is present.
  if (accessToken) {
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
  title: 'Authentication | Punjab Engineering College',
  description: 'Sign in to your PEC account to access the OmniFlow campus governance platform.',
};
