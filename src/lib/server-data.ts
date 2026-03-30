import { cookies } from 'next/headers';
import { unstable_cache } from 'next/cache';

/**
 * Authenticated SSR fetch via the Next.js proxy (/api -> localhost:8000).
 *
 * Uses the internal server URL for SSR (server -> backend directly for speed,
 * no client round-trip). Falls back gracefully on failure.
 */
export async function serverFetch(endpoint: string, options: RequestInit = {}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (!accessToken && !refreshToken) {
    // No session at all — skip the fetch silently
    return null;
  }

  // Always use the internal backend URL for Server→Backend calls (avoids Proxy hop)
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const baseUrl = process.env.INTERNAL_API_URL ?? 'http://localhost:8000';
  const url = `${baseUrl}/${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Cookie': `access_token=${accessToken ?? ''}; refresh_token=${refreshToken ?? ''}`,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(options.headers as Record<string, string> ?? {}),
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      // No caching during SSR so we always get fresh data
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status !== 401 && res.status !== 403) {
        console.warn(`[serverFetch] ${res.status} ${res.statusText} — ${url}`);
      }
      return null;
    }

    const json = await res.json();
    // Unwrap { success, data } envelope or return raw if different shape
    return json?.success === true ? json.data : json;
  } catch (err: any) {
    // ECONNREFUSED = backend not started yet — log once, don't crash SSR
    if (err?.cause?.code !== 'ECONNREFUSED') {
      console.error(`[serverFetch] fetch error — ${url}:`, err?.message ?? err);
    }
    return null;
  }
}

/**
 * Cached public fetch for shared/static data (department lists, course catalog, etc.).
 * Uses Next.js Data Cache with tag-based invalidation.
 *
 * Usage:
 *   const depts = await cachedServerFetch('/departments?limit=200', ['departments'], 3600);
 *
 * After a mutation, call:
 *   revalidateTag('departments'); // inside a Server Action
 */
export function cachedServerFetch(
  endpoint: string,
  tags: string[],
  revalidate = 3600,
) {
  const path = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  const url = `${process.env.INTERNAL_API_URL ?? 'http://localhost:8000'}/${path}`;

  return unstable_cache(
    async () => {
      try {
        const res = await fetch(url, {
          headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) return null;
        const json = await res.json();
        return json?.success === true ? json.data : json;
      } catch {
        return null;
      }
    },
    [url],
    { tags, revalidate },
  )();
}

