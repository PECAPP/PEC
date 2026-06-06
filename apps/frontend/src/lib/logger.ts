import { after } from 'next/server';
import { cookies } from 'next/headers';
import { resolveInternalApiBaseUrl } from './internal-api-url';

/**
 * Professional Audit Logger using Next.js 15+ 'after' API.
 * This runs after the response is sent to the user, ensuring zero impact on latency.
 */
export async function logActivity(action: string, entity: string, metadata: any = {}) {
  after(async () => {
    try {
      const cookieStore = await cookies();
      const token = cookieStore.get('access_token')?.value;

      const API = resolveInternalApiBaseUrl();
      
      // Fire-and-forget log to the backend
      await fetch(`${API}/audit-logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          action,
          entity,
          metadata: JSON.stringify(metadata),
          timestamp: new Date().toISOString(),
          source: 'Server Action',
        }),
      });
    } catch (error) {
      // Background logging failures should not crash the app
      console.error('[logActivity] Failed to log background activity:', error);
    }
  });
}
