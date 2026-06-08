import { cookies } from 'next/headers';
import { getSessionFromToken } from './session';

/**
 * Robust server-side session retriever using the unified `jose` based decoder.
 * Priority:
 * 1. access_token cookie (decoded as JWT)
 */
export async function getServerSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;
    const userIdCookie = cookieStore.get('user_id')?.value;
    const userRoleCookie = cookieStore.get('user_role')?.value;

    console.log('[getServerSession] accessToken present:', !!accessToken);

    const session = getSessionFromToken(accessToken, userIdCookie, userRoleCookie);
    
    if (!session) {
      console.log('[getServerSession] Returning null');
      return null;
    }

    console.log('[getServerSession] Decoded UID:', session.uid);
    return session;
  } catch (error) {
    console.error('Core SSR session error:', error);
    return null;
  }
}
